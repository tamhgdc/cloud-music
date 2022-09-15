// 使用localStorage做本地存储
export function setStorage(options){
    sessionStorage.setItem(options.key, JSON.stringify(options.value))
}
export function getStorage(key){
    return JSON.parse(sessionStorage.getItem(key))
}

export function delStorage(key){
    sessionStorage.removeItem(key)
}

    
