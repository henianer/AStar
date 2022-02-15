/*******************************************
文件: AStarManager
创建: 2021年10月21日 16:21
作者: 何斌(1997_10_23@sina.com)
描述:
    A星
*******************************************/

import AStarNode, { EAStarNodeType } from "./AStarNode";
import Singleton from "./Singleton";

export interface Coordinate {
    x: number;
    y: number;
}

export default class AStarManager extends Singleton<AStarManager> {

    private row: number = 0; // 行
    private column: number = 0; // 列

    public nodes: AStarNode[][] = [];
    // private turns: number = 0;
    private openList: AStarNode[] = [];
    private closeList: AStarNode[] = [];

    /**
     * 初始化地图信息
     * @param row 行
     * @param column 列
     */
    public initMapInfo(row: number, column: number) {
        this.row = row;
        this.column = column;
        this.nodes = [];
        // 根据宽高创建格子
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.column; j++) {
                let node = new AStarNode(j, i, Math.random() < 0.2 ? EAStarNodeType.Wall : EAStarNodeType.Rode);
                if (!this.nodes[i]) this.nodes[i] = [];
                this.nodes[i][j] = node;
            }
        }
        return this.nodes;
    }

    /**
     * 寻路
     * @param startCoo 起点
     * @param endCoo 终点
     */
    public pathfinding(startCoo: Coordinate, endCoo: Coordinate, is8Direction: boolean): AStarNode[] {
        // 首先判断传入的点是否合法 (边界溢出)
        if (startCoo.x < 0 || startCoo.x >= this.column || startCoo.y < 0 || startCoo.y >= this.row ||
            endCoo.x < 0 || endCoo.x >= this.column || endCoo.y < 0 || endCoo.y >= this.row) {
            cc.warn('开始或者结束点在地图外')
            return [];
        }
        let startNode: AStarNode = this.nodes[startCoo.y][startCoo.x];
        let endNode: AStarNode = this.nodes[endCoo.y][endCoo.x];
        if (startNode.type === EAStarNodeType.Wall || endNode.type === EAStarNodeType.Wall) {
            cc.warn('开始或者结束点为不可通路点')
            return [];
        }
        // 清空开启和关闭列表
        // this.turns = 0;
        this.openList = [];
        this.closeList = [];
        // 把开始点放入关闭列表中
        startNode.parent = null;
        startNode.g = 0;
        startNode.h = 0;
        startNode.f = 0;
        this.closeList.push(startNode);
        while (true) {
            // 上 y-1
            this.findAroundNodeToOpenList({ x: startNode.x, y: startNode.y - 1 }, 1, startNode, endNode);
            // 下 y+1
            this.findAroundNodeToOpenList({ x: startNode.x, y: startNode.y + 1 }, 1, startNode, endNode);
            // 左 x-1
            this.findAroundNodeToOpenList({ x: startNode.x - 1, y: startNode.y }, 1, startNode, endNode);
            // 右 x+1
            this.findAroundNodeToOpenList({ x: startNode.x + 1, y: startNode.y }, 1, startNode, endNode);
            if (is8Direction) {
                // 左上 x-1 y-1
                this.findAroundNodeToOpenList({ x: startNode.x - 1, y: startNode.y - 1 }, Math.sqrt(2), startNode, endNode);
                // 左下 x-1 y+1
                this.findAroundNodeToOpenList({ x: startNode.x - 1, y: startNode.y + 1 }, Math.sqrt(2), startNode, endNode);
                // 右上 x+1 y-1
                this.findAroundNodeToOpenList({ x: startNode.x + 1, y: startNode.y - 1 }, Math.sqrt(2), startNode, endNode);
                // 右下 x+1 y+1
                this.findAroundNodeToOpenList({ x: startNode.x + 1, y: startNode.y + 1 }, Math.sqrt(2), startNode, endNode);
            }

            // 如果开启列表为空还没有找到终点,就认为是死路
            if (this.openList.length === 0) {
                return [];
            }

            // 选中开启列表中消耗最小的一个点(排序)
            this.openList.sort(this.sortOpenList);
            // 将最小的消耗点放入关闭列表中 并删除最小的那个(找到的点变成新的起点，进行下一次)
            startNode = this.openList.shift();
            this.closeList.push(startNode);
            // 如果这个新起点为终点(已找完)
            if (startNode.x === endNode.x && startNode.y === endNode.y) {
                let path: AStarNode[] = [];
                path.push(endNode);
                while (endNode.parent != null) {
                    path.push(endNode.parent);
                    endNode = endNode.parent;
                }
                path.reverse();
                return path;
            }
        }
    }

    // public get getTurns() {
    //     return this.turns;
    // }

    private sortOpenList(a: AStarNode, b: AStarNode) {
        if (a.f >= b.f) return 1;
        return -1;
    }


    /**
     * 把临近的点放入开启列表
     * @param coo 点
     * @returns
     */
    private findAroundNodeToOpenList(coo: Coordinate, g: number, parent: AStarNode, endNode: AStarNode) {
        if (coo.x < 0 || coo.x >= this.column || coo.y < 0 || coo.y >= this.row) return;
        let node: AStarNode = this.nodes[coo.y][coo.x];
        // 判断这些点是否越界或者阻挡或者在开启或者关闭列表里 如果都不是 才放入开启列表里
        if (node == null || node.type === EAStarNodeType.Wall ||
            this.coordinateIndexOf(this.openList, coo) > -1 || this.coordinateIndexOf(this.closeList, coo) > -1) return;
        // 计算 F=G+H
        node.parent = parent; // 记录父对象
        node.g = parent.g + g; // 计算离起点的距离（自己与父对象的距离+父对象离起点的距离
        node.h = Math.abs(endNode.x - node.x) + Math.abs(endNode.y - node.y); // 曼哈顿街区算法
        node.f = node.g + node.h;
        this.openList.push(node);
    }

    private coordinateIndexOf(list: Coordinate[], coo: Coordinate) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].x === coo.x && list[i].y === coo.y) {
                return i;
            }
        }
        return -1;
    }
}
