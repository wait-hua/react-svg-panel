import React from 'react';
import ReactDOM from 'react-dom';
import SvgPanel from './svgPanel';
import './index.scss';

const nodes = [
    {
        id: 'id-one',
        name: '数据节点一',
        offsetX: 208,
        offsetY: 100,
        inSvg: true,
        inputSlot:[
            {
                index: 1,
                name: '输入插槽一'
            },
            {
                index: 2,
                name: '输入插槽二'
            }
        ],
        outputSlot: [
            {
                index: 1,
                name: '输出插槽一'
            },
            {
                index: 2,
                name: '输出插槽二'
            }
        ]
    },
    {
        id: 'id-two',
        name: '模型节点二',
        offsetX: 408,
        offsetY: 150,
        inSvg: true,
        inputSlot:[
            {
                index: 1,
                name: '输入插槽一'
            },
            {
                index: 2,
                name: '输入插槽二'
            },
            {
                index: 3,
                name: '输入插槽三'
            },
            {
                index: 4,
                name: '输入插槽四'
            }
        ],
        outputSlot: [
            {
                index: 1,
                name: '输出插槽一'
            }
        ]
    },
    {
        id: 'id-three',
        name: '模型节点三',
        offsetX: 438,
        offsetY: 250,
        inSvg: true,
        inputSlot:[
            {
                index: 1,
                name: '输入插槽一'
            },
            {
                index: 2,
                name: '输入插槽二'
            },
            {
                index: 3,
                name: '输入插槽三'
            },
            {
                index: 4,
                name: '输入插槽四'
            }
        ],
        outputSlot: [
            {
                index: 1,
                name: '输出插槽一'
            },
            {
                index: 2,
                name: '输出插槽一'
            }
        ]
    },
    {
        id: 'id-four',
        name: '模型节点四',
        offsetX: 538,
        offsetY: 350,
        inSvg: true,
        inputSlot:[
            {
                index: 1,
                name: '输入插槽一'
            },
            {
                index: 2,
                name: '输入插槽二'
            },
            {
                index: 3,
                name: '输入插槽三'
            }
        ],
        outputSlot: [
            {
                index: 1,
                name: '输出插槽一'
            }
        ]
    },
    {
        id: 'id-five',
        name: '模型节点五',
        offsetX: 138,
        offsetY: 450,
        inSvg: true,
        inputSlot:[
            {
                index: 1,
                name: '输入插槽一'
            }
        ],
        outputSlot: [
            {
                index: 1,
                name: '输出插槽一'
            }
        ]
    }
];

ReactDOM.render(
    <div styleName="svg-desc">
        <p>1. 框内svg可鼠标滚动放大缩小。鼠标点击不放开移动svg。</p>
        <p>2. svg图内节点可自由拖拽移动。双击节点删除。</p>
        <p>3. 点击节点下方一排圈圈不放开鼠标，鼠标移动划线，进入另外节点松开鼠标，可连线两个节点。</p>
        <p>4. 双击连线，可删除连线。</p>
        <p>5. 节点之间连线不会产生环，节点上方圈圈每个只能连线一条连线。</p>
        <div styleName="svg-wrap">
            <SvgPanel nodes={nodes}/>
        </div>
    </div>,
    document.querySelector('#root')
);
