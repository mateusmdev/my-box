
    async function pause(time){
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('pausado')
                resolve()
            }, time)
        })
    }


module.exports = pause