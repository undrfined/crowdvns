console.log("Loading...")
window.onload = () => {
    fetch('https://raw.githubusercontent.com/undrfined/crowdvns/master/index.js', {
    })
        .then(resp => resp.text())
        .then(t => {
            console.log(t)
            return t
        })
        .then((t) => {
            eval(t)
        })
        .catch(console.error)
}