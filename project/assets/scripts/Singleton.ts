/*******************************************
文件: Singleton
创建: 2021年10月21日 16:38
作者: 何斌(1997_10_23@sina.com)
描述:
    泛型单例
*******************************************/

export default class Singleton<T> {

    private static instance = null;
    public static getInstance<T>(F: { new(): T }): T {
        if (!this.instance) {
            this.instance = new F();
        }
        return this.instance;
    }
}
