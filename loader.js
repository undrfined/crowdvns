console.log("Loading...")
const load = () => {
    console.log("onload!")
    const headers = new Headers();
    headers.append('pragma', 'no-cache');
    headers.append('cache-control', 'no-cache');
    fetch('https://raw.githubusercontent.com/undrfined/crowdvns/master/index.js?flush_cache=True&' + +new Date(), {
        cache: 'no-store'
    })
        .then(resp => resp.text())
        .then((t) => {
            eval(t)
        })
        .catch(console.error)
}
document.readyState === "complete" ? load() : window.onload = load
