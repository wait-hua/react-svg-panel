/**
 * [hasLoop 判断加入当前有向边后是否产生环]
 * @param  {number} id1 [起始顶点id]
 * @param  {number} id2 [终止顶点id]
 * @param  {number} paths [所有路径]
 * @param  {number} nodes [所有顶点]
 * @return {boolean} [是否产生环]
 */
function hasLoop(id1, id2, paths, nodes) {
    const pathData = JSON.parse(JSON.stringify(paths));
    const nodeMap = {};
    let outNodeNum = 0;
    const nodeCount = nodes.length;
    pathData.push({
        from: id1,
        to: id2,
    });

    // initial data
    for (let i = 0; i < nodeCount; i += 1) {
        const id = nodes[i].id;
        nodeMap[id] = {};
        nodeMap[id].inDegree = 0;
        nodeMap[id].nodeState = true;
        nodeMap[id].outPath = [];
    }
    for (let j = 0; j < pathData.length; j += 1) {
        nodeMap[pathData[j].to].inDegree += 1;
        nodeMap[pathData[j].from].outPath.push(j);
    }

    // topological sort
    while (true) {
        let findNode = false;
        const keys = Object.keys(nodeMap);
        for (let i = 0, len = keys.length; i < len; i += 1) {
            const key = keys[i];
            if (nodeMap[key].nodeState && nodeMap[key].inDegree === 0) {
                findNode = true;
                nodeMap[key].nodeState = false;
                outNodeNum += 1;
                for (let j = 0; j < nodeMap[key].outPath.length; j += 1) {
                    nodeMap[pathData[nodeMap[key].outPath[j]].to].inDegree -= 1;
                }
                break;
            }
        }
        if (!findNode) break;
    }

    return !(outNodeNum === nodeCount);
}

export default hasLoop;
