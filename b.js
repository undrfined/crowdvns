// const $continue = document.querySelector(".continuebutton, .quizstartbuttondiv")
// const id = new URLSearchParams(window.location.search).get('id')
// const btn = cr("button", "PDF", "btn")
// $continue.appendChild(btn)
// const $main = document.querySelector("#region-main")
// btn.addEventListener("click", () => {
//     $main.innerHTML = ""
//     const ref = database.ref("questions").child(id)
//     ref.on("value", (snapshot) => {
//         Object.values(snapshot.val()).forEach((a) => {
//             console.log(a)
//             const wow = document.createElement("div")
//             wow.innerHTML += a.data + "<hr>"
//
//             if(a.answers) {
//                 console.log(a.data)
//                 const labels = Array.from(wow.querySelectorAll("label")).map(async l => ({
//                     hash: await hashCode(l.innerText),
//                     $label: l
//                 }))
//
//                 const total = Object.values(a.answers).reduce((acc, it) => acc + Object.values(it).filter(Boolean).length, 0)
//
//                 labels.forEach(({hash, $label}) => {
//                     const k = a.answers[hash]
//                     if (!k) {
//                         $label.innerText += ` (Unknown answer?)`
//                         // No answer found?
//                         return
//                     }
//                     const count = Object.values(k).filter(Boolean).length
//                     $label.innerText += ` (${Math.floor((count / total) * 100)}% / ${count} voted)`
//                     $label.classList.toggle("valid", count === total)
//                     if (count === total) {
//                         const $input = $label.parentNode.querySelector("input:not([type='hidden'])")
//                         console.log($input)
//                         $input.checked = true
//                     }
//                 })
//             }
//
//             $main.appendChild(wow)
//         })
//         $main.querySelectorAll(".info").forEach(l => l.innerHTML = "")
//         $main.querySelectorAll(".crowd").forEach(l => l.innerHTML = "")
//     })
//
// })
