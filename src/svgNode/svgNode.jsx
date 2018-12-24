import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Draggable } from 'react-draggable-and-droppable';

import './SvgNode.scss';

class SvgNode extends PureComponent {
    static propTypes = {
        onDrag: PropTypes.func,
        onDragStart: PropTypes.func,
        node: PropTypes.shape({
            inputSlot: PropTypes.arrayOf(PropTypes.object),
            outputSlot: PropTypes.arrayOf(PropTypes.object),
            offsetX: PropTypes.number,
            offsetY: PropTypes.number,
            id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        }).isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        setDrawNode: PropTypes.func,
        setJoinNode: PropTypes.func,
        clearJoinNode: PropTypes.func,
        delNode: PropTypes.func,
    };

    static defaultProps = {
        onDrag: () => { },
        onDragStart: () => { },
        setDrawNode: () => { },
        setJoinNode: () => { },
        clearJoinNode: () => { },
        delNode: () => { },
    };

    onDrag = (event) => {
        this.props.onDrag(event);
    };

    onDragStart = (event) => {
        this.props.onDragStart(event);
    };

    // 点击输出插槽，准备连线
    onMouseDown = (event, outSlotId, outSolotIndex) => {
        event.stopPropagation();
        // 记录要开始连线的，计算好outSlot的位置，用于创建连线
        const { node, width, height } = this.props;
        const { offsetX, offsetY, outputSlot } = node;
        const outSlotLen = outputSlot.length;
        // 根据是第几个输出slot, 计算出path的起始位置
        const relativeX = width / (outSlotLen + 1) * outSolotIndex;
        const posX = offsetX + relativeX;
        const drawNode = {
            nodeId: node.id,
            slotId: outSlotId,
            x: posX,
            relativeX,
            y: offsetY + height + 5
        };
        this.props.setDrawNode(drawNode);
    }

    onMouseEnter = (inSlotId, inSlotIndex) => {
        // 根据是第几个输入slot, 计算好path的结束位置
        const { node, width } = this.props;
        const { offsetX, offsetY, inputSlot } = node;
        const relativeX = width / (inputSlot.length + 1) * inSlotIndex;
        const posX = offsetX + relativeX;
        const joinNode = {
            nodeId: node.id,
            slotId: inSlotId,
            x: posX,
            relativeX,
            y: offsetY
        };
        this.props.setJoinNode(joinNode);
    };

    onMouseLeave = () => {
        this.props.clearJoinNode();
    }
    delNode = () => {
        this.props.delNode(this.props.node.id);
    }
    renderInSlots = () => {
        let { inputSlot } = this.props.node;
        if (!inputSlot) {
            inputSlot = [];
        }
        const width = 100 / (inputSlot.length + 1);
        return (
            <React.Fragment>
                <div styleName="in-slot">
                    {inputSlot.map(inslot => (
                        <div
                            styleName="port-wrap"
                            style={{ width: `${width}%` }}
                            key={inslot.index}>
                            <div styleName="pane-port" data-id={inslot.index}>
                                <span styleName="port-magnet" />
                            </div>
                        </div>
                    ))}
                </div>
                <div styleName="in-slot-proxy">
                    {inputSlot.map((inslot, idx) => (
                        <div
                            styleName="slot-proxy-item"
                            data-id={inslot.index}
                            key={inslot.index}
                            onMouseEnter={() => this.onMouseEnter(inslot.index, idx + 1)} />
                    ))}
                </div>
            </React.Fragment>
        );
    };

    renderOutSlots = () => {
        const { outputSlot } = this.props.node;
        if (!outputSlot || !outputSlot.length) {
            return null;
        }
        const width = 100 / (outputSlot.length + 1);
        return (
            <div styleName="out-slot">
                {outputSlot.map((outslot, idx) => (
                    <div
                        styleName="port-wrap"
                        style={{ width: `${width}%` }}
                        key={outslot.index}>
                        <div
                            styleName="pane-port"
                            id={outslot.index}
                            data-id={outslot.index}
                            onMouseDown={$event => this.onMouseDown(
                                $event, outslot.index, idx + 1
                            )}>
                            <span styleName="port-magnet" />
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    render() {
        const { node } = this.props;
        return (
            <React.Fragment>
                <g
                    transform={`translate(${node.offsetX},${node.offsetY})`}
                    onMouseLeave={this.onMouseLeave}
                    onDoubleClick={this.delNode} >
                    <Draggable
                        proxy=""
                        value={node}
                        onDragStart={this.onDragStart}
                        onDrag={this.onDrag}>
                        <g>
                            <foreignObject width="180" height="30">
                                <div styleName="content-wrap">
                                    <div styleName="content">
                                        <span styleName="title">{node.name}</span>
                                    </div>
                                    {this.renderInSlots()}
                                    {this.renderOutSlots()}
                                </div>
                            </foreignObject>
                        </g>
                    </Draggable>
                </g>
            </React.Fragment>
        );
    }
}

export default SvgNode;
