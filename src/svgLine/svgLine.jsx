import React from 'react';
import PropTypes from 'prop-types';
import getCurvePath from '../utils/getCurvePath';
import './SvgLine.scss';

const SvgLine = (props = {}) => {
    const { startPoint, endPoint } = props.path;
    const { delLine, index } = props;
    const curve = getCurvePath(startPoint, endPoint);

    const onDoubleClick = () => {
        delLine(index);
    };

    return (
        <g
            styleName="panel-line"
            onDoubleClick={onDoubleClick}>
            <path
                styleName="line-wrap"
                strokeLinejoin="round"
                markerStart="url(#markerArrow)"
                d={curve} />
            <path
                styleName="line"
                strokeLinejoin="round"
                markerStart="url(#markerArrow)"
                d={curve} />
        </g>
    );
};

SvgLine.propTypes = {
    path: PropTypes.shape({
        startPoint: PropTypes.object,
        endPoint: PropTypes.object
    }).isRequired,
    delLine: PropTypes.func,
    index: PropTypes.number.isRequired
};

SvgLine.defaultProps = {
    delLine: () => {}
};

export default SvgLine;
