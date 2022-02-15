import AStarManager, { Coordinate } from "./AStarManager";
import AStarNode, { EAStarNodeType } from "./AStarNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AStarTest extends cc.Component {

    @property({ type: cc.Prefab, displayName: '单元格' })
    public prefabCell: cc.Prefab = null;

    @property({ type: cc.Node, displayName: '单元格' })
    public cells: cc.Node = null;

    @property({ type: cc.Button, displayName: '寻路按钮' })
    public btnPathfinding: cc.Button = null;

    @property({ type: cc.Toggle, displayName: '8方向' })
    public toggleDirection: cc.Toggle = null;

    @property({ displayName: '修改数值', tooltip: '默认宽高100*100,默认行列5*5,默认4方向' })
    public modifyData = false;

    @property({ displayName: '是否8方向', visible() { return this.modifyData } })
    public is8Direction = false;

    @property({ displayName: '单元格_宽', visible() { return this.modifyData } })
    public cellWidth = 100;

    @property({ displayName: '单元格_高', visible() { return this.modifyData } })
    public cellHeight = 100;

    @property({ displayName: '行', visible() { return this.modifyData } })
    public row = 5; // 行

    @property({ displayName: '列', visible() { return this.modifyData } })
    public column = 5; // 列

    private startCoo: Coordinate = { x: -1, y: -1 };
    private endCoo: Coordinate = { x: -1, y: -1 };
    private cellArray: cc.Node[][] = [];
    private list: AStarNode[] = [];
    private isPathfinding = false;


    public onLoad() {
        this.createCell();
        this.touchStart();
    }

    public start() {
        this.refreshToggle();
    }

    public createCell() {
        // 初始化地图数据
        let mapData = AStarManager.getInstance(AStarManager).initMapInfo(this.row, this.column);
        // console.log(mapData);

        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.column; j++) {
                let cell = cc.instantiate(this.prefabCell);
                cell.parent = this.cells;
                cell.width = this.cellWidth;
                cell.height = this.cellHeight;
                let x = -((this.column - 1) / 2 * this.cellWidth) + j * this.cellWidth;
                let y = ((this.row - 1) / 2 * this.cellHeight) - i * this.cellHeight;
                cell.setPosition(x, y);
                cell.getChildByName('Coordinate').getComponent(cc.Label).string = `${j},${i}`;
                let node = AStarManager.getInstance(AStarManager).nodes[i][j];
                if (node.type === EAStarNodeType.Wall) {
                    cell.color = cc.Color.GRAY;
                }

                if (!this.cellArray[i]) this.cellArray[i] = [];
                this.cellArray[i].push(cell);
            }
        }
    }

    public touchStart() {
        this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Touch) => {
            for (let i = 0; i < this.cellArray.length; i++) {
                for (let j = 0; j < this.cellArray[i].length; j++) {
                    let tag = this.cellArray[i][j].getBoundingBoxToWorld().contains(event.getLocation());
                    if (tag) {
                        if (AStarManager.getInstance(AStarManager).nodes[i][j].type === EAStarNodeType.Wall) {
                            return console.log(`墙不能作为起点或者终点(${j},${i})`);
                        }
                        if (this.startCoo.x === -1 && this.startCoo.y === -1) {
                            this.startCoo = { x: j, y: i };
                            this.cellArray[i][j].color = cc.Color.RED;
                            console.log(`设置起点(${j},${i})`);
                        }
                        else if (this.startCoo.x === j && this.startCoo.y === i) {
                            this.startCoo = { x: -1, y: -1 };
                            this.cellArray[i][j].color = cc.Color.WHITE;
                            console.log(`取消起点(${j},${i})`);
                        }
                        else if (this.endCoo.x === -1 && this.endCoo.y === -1) {
                            this.endCoo = { x: j, y: i };
                            this.cellArray[i][j].color = cc.Color.BLUE;
                            console.log(`设置终点(${j},${i})`);
                        }
                        else if (this.endCoo.x === j && this.endCoo.y === i) {
                            this.endCoo = { x: -1, y: -1 };
                            this.cellArray[i][j].color = cc.Color.WHITE;
                            console.log(`取消终点(${j},${i})`);
                        }
                        // else console.log('已经有起点或者终点');

                        if (this.list.length > 0 && !this.isPathfinding) {
                            this.startCoo = { x: -1, y: -1 };
                            this.endCoo = { x: -1, y: -1 };
                            for (let i = 0; i < this.list.length; i++) {
                                this.cellArray[this.list[i].y][this.list[i].x].color = cc.Color.WHITE;
                            }
                            this.list = [];
                        }

                        if (this.startCoo.x > -1 && this.startCoo.y > -1 && this.endCoo.x > -1 && this.endCoo.y > -1 && !this.isPathfinding) {
                            this.btnPathfinding.node.active = true;
                        } else {
                            this.btnPathfinding.node.active = false;
                        }

                        break;
                    }
                }
            }
        }, this);
    }

    private async onclickPathfinding() {
        this.isPathfinding = true;
        this.btnPathfinding.node.active = false;
        this.list = AStarManager.getInstance(AStarManager).pathfinding(this.startCoo, this.endCoo, this.is8Direction);
        if (this.list.length === 0) {
            this.isPathfinding = false;
            this.cellArray[this.startCoo.y][this.startCoo.x].color = cc.Color.WHITE;
            this.cellArray[this.endCoo.y][this.endCoo.x].color = cc.Color.WHITE;
            this.startCoo = { x: -1, y: -1 };
            this.endCoo = { x: -1, y: -1 };
            return console.log('无路径可到达');
        }
        for (let i = 0; i < this.list.length; i++) {
            await this.sleep(0.1);
            this.cellArray[this.list[i].y][this.list[i].x].color = cc.Color.GREEN;
            if (i === this.list.length - 1) this.isPathfinding = false;
        }
    }

    private refreshToggle() {
        this.toggleDirection.isChecked = this.node.getComponent(AStarTest).is8Direction;
    }

    /** 点击复选框 */
    private onclickToggle(event?: cc.Event, param?: string) {
        this.node.getComponent(AStarTest).is8Direction = this.toggleDirection.isChecked;
    }

    /**
    * 延迟指定秒
    * @param timeSecond 单位秒
    * @param driveComponent 驱动组件，不指定将使用setTimeout(游戏进入后台都可能运行)
    */
    public sleep(timeSecond: number, driveComponent?: cc.Component): Promise<number> {
        return new Promise<number>((resolve) => {
            if (driveComponent) {
                driveComponent.scheduleOnce(() => {
                    resolve(timeSecond);
                }, timeSecond);
            }
            else {
                setTimeout(() => {
                    resolve(timeSecond);
                }, timeSecond * 1000);
            }
        });
    }
}
