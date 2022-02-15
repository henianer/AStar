/*******************************************
文件: AStarNode
创建: 2021年10月21日 16:06
作者: 何斌(1997_10_23@sina.com)
描述:
    A*格子类
*******************************************/

export enum EAStarNodeType {
    Rode,
    Wall
}

export default class AStarNode {

    public x: number = -1;
    public y: number = -1;

    public f: number = 0;
    public g: number = 0;
    public h: number = 0;
    public parent: AStarNode = null;
    public type: EAStarNodeType = null;

    constructor(x: number, y: number, type: EAStarNodeType) {
        this.x = x;
        this.y = y;
        this.type = type;
    }
}
