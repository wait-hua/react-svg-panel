/**
 * [getCurvePath 获取贝塞尔曲线路径]
 * @param  pointA [起点坐标]
 * @param  pointB [终点坐标]
 * @return [贝塞尔曲线路径]
 */
function getCurvePath(pointA, pointB) {
    const point1 = pointB;
    const point2 = {
        x: (pointA.x + pointB.x) / 2,
        y: (pointA.y + pointB.y) / 2,
    };
    let x;
    let y;
    let tempX;
    let tempY;
    if (point1.y >= point2.y) {
        if (Math.abs(point1.x - point2.x) <= 10) {
            x = point1.x;
            y = point1.y;
        } else {
            x = point1.x;
            y = point2.y + ((point1.y - point2.y) * 2) / 5;
        }
    } else {
        const lengthX = 2 * Math.abs(point1.x - point2.x);
        const lengthY = 2 * Math.abs(point1.y - point2.y);
        if (lengthX >= lengthY) {
            tempX = (lengthY * lengthY) / (2 * lengthX);
            tempY = lengthY / 2;
            x = point1.x > point2.x ? point1.x - tempX : point1.x + tempX;
            y = point1.x > point2.x ? point1.y - tempY : point1.y - tempY;
        } else {
            tempX = (lengthX * lengthX) / (2 * lengthY);
            tempY = lengthX / 2;
            x = point1.x > point2.x ? point1.x - tempX : point1.x + tempX;
            y = point1.x > point2.x ? point1.y - tempY : point1.y - tempY;
        }
    }
    return `M${pointB.x} ${pointB.y} Q ${x} ${y}, ${point2.x} ${point2.y} T ${
        pointA.x
    } ${pointA.y}`;
}

export default getCurvePath;
