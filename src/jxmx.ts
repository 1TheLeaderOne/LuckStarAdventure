export class Jxmx {
    /**
     * 注册组件
     * @param {string} name - 组件名称
     * @param {any} component - 组件对象
     */
    register(name:string, component:any) {
        if(this[name]){
            throw new Error(`组件${name}已存在，请勿重复注册`);
        }

        this[name] = component;
    }
}

//@ts-ignore
window.jxmx = new Jxmx();