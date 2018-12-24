import React, { PureComponent } from 'react';
import * as ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Droppable } from 'react-draggable-and-droppable';
import getCurvePath from '../utils/getCurvePath';
import hasLoop from '../utils/hasLoop';
import getUUID from '../utils/uuid';
import SvgLine from '../SvgLine';
import SvgNode from '../SvgNode';
import './SvgPanel.scss';

// 节点大小的位置
const NODEWIDTH = 180;
const NODEHEIGHT = 30;

class SvgPanel extends PureComponent {
    svg = React.createRef();

    // 记录是否画布移动
    canvasMove = false;

    pathGenerate = false; // 是否开始连线

    static propTypes = {
        onSelect: PropTypes.func,
        // eslint-disable-next-line react/forbid-prop-types
        delNode: PropTypes.func,
    };

    static defaultProps = {
        onSelect: () => { },
        delNode: () => { },
    };

    // 缓存一些信息
    constructor(props) {
        super(props);
        // 缓存一下
        this.svgCache = {
            startPos: { x: 0, y: 0 }, // 移动画布的鼠标初始位置
            drawNode: null, // 记录准备连线的起点Node
            joinNode: null, // 要连线的终点Node
            pathStartPoint: null,
        };
        
        this.state = {
            scale: 1,
            curve: 'M0 0',
            scaleOffset: {
                x: 0,
                y: 0
            },
            moveOffset: {
                x: 0,
                y: 0
            },
            nodes: props.nodes || [],
            paths: [],
            fullScreen: false
        };
    }

    componentDidMount() {
        this.svg.current.addEventListener('mousewheel', this.onMousewheel);
    }

    componentWillUnmount() {
        this.svg.current.removeEventListener('mousewheel', this.onMousewheel);
    }


    // 获取svg画布父节点的信息
    getBounding() {
        // eslint-disable-next-line react/no-find-dom-node
        const svgNode = ReactDOM.findDOMNode(this.svg.current);
        if (svgNode) {
            const svgWrap = svgNode.parentNode.getBoundingClientRect();
            return {
                startLeft: svgWrap.left,
                startTop: svgWrap.top
            };
        }
        return {};
    }

    onDrop = (event) => {
        const { value, pageX, pageY } = event;
        if (value && value.inSvg) {
            return;
        }
        const {
            nodes, scale, scaleOffset, moveOffset
        } = this.state;
        const { startLeft, startTop } = this.getBounding();
        const offsetX = (pageX - startLeft - scaleOffset.x) / scale
            - moveOffset.x - NODEWIDTH / 2;
        const offsetY = (pageY - startTop - scaleOffset.y) / scale
            - moveOffset.y - NODEHEIGHT / 2;

        const UUID = getUUID();
        const dropNode = {
            id: UUID, // 实例id
            name: value.name,
            inSvg: true,
            offsetX,
            offsetY,
            inputSlot: value.inputSlot,
            outputSlot: value.outputSlot,
        };

        const allNodes = [...nodes];
        allNodes.push(dropNode);
        this.setState({
            nodes: allNodes
        });
    };

    onDragStart = () => {
        // this.highLightNode();
    };

    // 拖拽节点更新节点位置 及 连线的位置
    onDrag = (event) => {
        const {
            nodes, scale, scaleOffset, moveOffset, paths
        } = this.state;
        const { pageX, pageY, value } = event;

        const { startLeft, startTop } = this.getBounding();

        // 计算最终需要放置的位置
        const offsetX = (pageX - startLeft - scaleOffset.x)
            / scale - moveOffset.x - NODEWIDTH / 2;
        const offsetY = (pageY - startTop - scaleOffset.y)
            / scale - moveOffset.y - NODEHEIGHT / 2;

        // 连接线的更新，节点上下游的连线坐标都需要更新
        const dragNodeId = value.id;
        const newPaths = paths.map((path) => {
            const obj = { ...path };
            if (path.from === dragNodeId) {
                // 更新startPoint坐标
                obj.startPoint.x = offsetX + obj.startPoint.relativeX;
                obj.startPoint.y = offsetY + NODEHEIGHT + 5;
            } else if (path.to === dragNodeId) {
                // 更新endPoint坐标
                obj.endPoint.x = offsetX + obj.endPoint.relativeX;
                obj.endPoint.y = offsetY;
            }
            return obj;
        });

        this.setState({
            nodes: nodes.map((item) => {
                const obj = { ...item };
                if (item.id === value.id) {
                    obj.offsetX = offsetX;
                    obj.offsetY = offsetY;
                }
                return obj;
            }),
            paths: newPaths
        });
    };

    // 放大/缩小画布
    onMousewheel = (event) => {
        event.preventDefault();
        // event.nativeEvent.preventDefault();
        if (this.state.showRenameIpt) {
            this.$nameIpt.current.blur();
            return;
        }
        let { scale } = this.state;
        const { scaleOffset } = this.state;
        const { pageX, pageY, deltaY } = event;
        const { startLeft, startTop } = this.getBounding();

        const rawX = (pageX - startLeft) * (1 - scale);
        const rawY = (pageY - startTop) * (1 - scale);
        const diffX = rawX - scaleOffset.x;
        const diffY = rawY - scaleOffset.y;

        scale += -1 * deltaY * 0.05; // deltaY与传统的wheelDelta 值是反的
        if (scale < 0.35) scale = 0.35;
        if (scale > 5) scale = 5;

        const x = (pageX - startLeft) * (1 - scale);
        const y = (pageY - startTop) * (1 - scale);
        scaleOffset.x = x - diffX;
        scaleOffset.y = y - diffY;

        this.setState({ scale, scaleOffset });
    };

    onMouseDown = (event) => {
        if (event.target instanceof Element && event.target.tagName === 'svg') {
            this.canvasMove = true;
            // 记录鼠标初始位置，
            this.svgCache.startPos = {
                x: event.pageX,
                y: event.pageY
            };
        }
    };

    onMouseMove = (event) => {
        if (this.canvasMove) this.moveCanvas(event);
        if (this.pathGenerate) this.drawPath(event);
    };

    onMouseUp = () => {
        if (this.canvasMove) {
            this.canvasMove = false;
        }
        if (this.pathGenerate) {
            this.pathMouseUp();
        }
    };

    // 画布的移动
    moveCanvas = (event) => {
        if (this.state.showRenameIpt) {
            this.$nameIpt.current.blur();
            return;
        }
        const { pageX, pageY } = event;
        const { scale, moveOffset } = this.state;

        const moveX = (pageX - this.svgCache.startPos.x) / scale,
            moveY = (pageY - this.svgCache.startPos.y) / scale;
        this.setState({
            moveOffset: {
                x: moveOffset.x + moveX,
                y: moveOffset.y + moveY
            }
        });
        // 每次移动的距离是差额，需要重新设置起始点位置
        this.svgCache.startPos.x = pageX;
        this.svgCache.startPos.y = pageY;
    };

    setDrawNode = (node) => {
        this.svgCache.drawNode = node;
        this.pathGenerate = true;
    }

    // 拖动时画线
    drawPath = (event) => {
        const { drawNode } = this.svgCache;
        this.svgCache.pathStartPoint = drawNode;
        const { startLeft, startTop } = this.getBounding();
        const { scaleOffset, moveOffset, scale } = this.state;

        const endPoint = {
            x: (event.pageX - startLeft - scaleOffset.x) / scale - moveOffset.x,
            y: (event.pageY - startTop - scaleOffset.y) / scale - moveOffset.y - 4
        };
        this.pathGenerate = true;
        this.setState({
            curve: getCurvePath(this.svgCache.pathStartPoint, endPoint)
        });
    }

    setJoinNode = (node) => {
        if (!this.pathGenerate) {
            return;
        }
        this.svgCache.joinNode = node;
    }

    clearJoinNode = () => {
        if (this.svgCache.joinNode) {
            this.svgCache.joinNode = '';
        }
    }

    // 画线结束，判断是否需要新增线，否则清空当前curv
    pathMouseUp = () => {
        // 不可成环判断、已经存在的线不重复画、一个输入slot只能连接一根线
        if (this.svgCache.joinNode) {
            const { paths, nodes } = this.state;
            // 判断是否成环了
            const isLoop = hasLoop(
                this.svgCache.drawNode.nodeId,
                this.svgCache.joinNode.nodeId,
                paths,
                nodes
            );
            // 判断连线是否存在
            const hasPath = paths.some(
                path => path.from === this.svgCache.drawNode.nodeId
                    && path.to === this.svgCache.joinNode.nodeId
                    && path.startPoint.slotId === this.svgCache.drawNode.slotId
                    && path.endPoint.slotId === this.svgCache.joinNode.slotId
            );
            // 判读连接点的inSlot是否已经存在连线
            const isInSlotHasLine = paths.some(
                path => path.to === this.svgCache.joinNode.nodeId
                    && path.endPoint.slotId === this.svgCache.joinNode.slotId
            );
            if (isLoop) {
                console.log('不可发生自环');
            } else if (!hasPath && !isInSlotHasLine) {
                paths.push({
                    startPoint: this.svgCache.pathStartPoint,
                    endPoint: this.svgCache.joinNode,
                    from: this.svgCache.pathStartPoint.nodeId, // 节点的id
                    to: this.svgCache.joinNode.nodeId,
                    fromSlot: this.svgCache.pathStartPoint.slotId, // 插槽的id
                    toSlot: this.svgCache.joinNode.slotId
                });
                this.setState({
                    paths: [...paths]
                });
            }
        }

        this.pathGenerate = false;
        // drawNode的置空必须放到最下面执行，且必须执行，勿移动此代码位置
        this.svgCache.drawNode = null;
        this.setState({
            curve: 'M0 0'
        });
    }

    // 删除连线
    delLine = (index) => {
        const { paths } = this.state;
        paths.splice(index, 1);
        this.setState({
            paths: [...paths]
        });
    }

    // 删除节点及和有关节点的连线
    delNode = (id) => {
        this.setState((preState) => {
            const { nodes, paths } = preState;
            const index = nodes.findIndex(node => node.id === id);
            nodes.splice(index, 1);
            const filterPaths = paths.filter((path) => {
                if (path.from === id || path.to === id) {
                    return false;
                }
                return true;
            });
            return {
                nodes: [...nodes],
                paths: [...filterPaths]
            };
        });
        this.props.delNode(id);
    }

    originSvg = () => {
        this.setState({
            scale: 1,
            scaleOffset: {
                x: 0,
                y: 0
            },
            moveOffset: {
                x: 0,
                y: 0
            }
        });
    }

    fullScreenSvg = () => {
        this.setState({
            fullScreen: true
        });
    }

    outFullScreenSvg = () => {
        this.setState({
            fullScreen: false
        });
    }

    render() {
        const {
            nodes, scale, scaleOffset, moveOffset, curve, paths,
            fullScreen
        } = this.state;
        return (
            <div className={fullScreen ? 'svg-fullscreen' : ''}>
                <div className="svg-tool">
                    <span title="原始大小" onClick={this.originSvg}>
                        原始大小
                    </span>
                    {fullScreen ? (
                        <span title="退出全屏" onClick={this.outFullScreenSvg}>
                            退出全屏
                        </span>
                    ) : (
                        <span title="全屏" onClick={this.fullScreenSvg}>
                            全屏
                        </span>
                    )}
                </div>
                <Droppable onDrop={this.onDrop}>
                    <svg
                        styleName="svg-panel"
                        width="5000"
                        height="5000"
                        ref={this.svg}
                        // onWheel={this.onMousewheel}
                        onMouseDown={this.onMouseDown}
                        onMouseMove={this.onMouseMove}
                        onMouseUp={this.onMouseUp}>
                        <g
                            transform={`matrix(${scale},0,0,${scale},${scaleOffset.x},${
                                scaleOffset.y
                            })`}>
                            <g transform={`translate(${moveOffset.x}, ${moveOffset.y})`}>
                                {nodes.map(item => (
                                    <SvgNode
                                        key={item.name}
                                        node={item}
                                        width={NODEWIDTH}
                                        height={NODEHEIGHT}
                                        onDragStart={this.onDragStart}
                                        onDrag={this.onDrag}
                                        setDrawNode={this.setDrawNode}
                                        setJoinNode={this.setJoinNode}
                                        clearJoinNode={this.clearJoinNode}
                                        delNode={this.delNode} />
                                ))}
                                <path
                                    styleName="path"
                                    d={curve}
                                    strokeLinejoin="round"
                                    markerMid="url(#arrow)" />
                                <defs>
                                    <marker
                                        styleName="path-marker"
                                        id="markerArrow"
                                        markerWidth="13"
                                        markerHeight="13"
                                        refX="6"
                                        refY="2"
                                        orient="0"
                                        markerUnits="userSpaceOnUse">
                                        <path d="M2,2 L10,2 L6,6 L2,2" style={{ fill: '#666' }} />
                                    </marker>
                                </defs>
                                {paths.map((path, idx) => (
                                    <SvgLine
                                        key={`${path.from}${path.fromSlot}${path.toSlot}${path.to}`}
                                        index={idx}
                                        path={path}
                                        delLine={this.delLine} />
                                ))}
                            </g>
                        </g>
                    </svg>
                </Droppable>
            </div>
        );
    }
}

export default SvgPanel;
