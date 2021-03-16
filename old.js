// ==UserScript==
// @name         crowdvns
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Crowdsource the vns!
// @author       undrfined
// @match        http://vns.lpnu.ua/mod/quiz/*.php*
// @require      https://www.gstatic.com/firebasejs/8.2.4/firebase.js
// @icon         https://www.google.com/s2/favicons?domain=lpnu.ua
// @grant    GM_addStyle
// ==/UserScript==

/*const div = document.createElement("div")
div.classList.add("state")
div.innerText = "20 crowdsourcers answered"

document.querySelector(".info").appendChild(div)
const auto = document.createElement("a")
auto.classList.add("state")
auto.innerText = "Auto-answer"
auto.href = "#"
document.querySelector(".info").appendChild(auto)*/
(function() {
    'use strict';
    const usertext = document.querySelector(".usertext")
    const username = usertext.innerText
    const uid = document.querySelector(".logininfo a").href.match(/id=(.+)/)[1]
    const header = document.querySelector(".site-name")
    const text = document.createElement("sub")

    text.innerText = " crowdvns v0.2"
    text.classList.add("crowd-logo")
    header.appendChild(text)

    GM_addStyle ( `
    .crowd.valid {
    color: green !important;
    font-weight: 700 !important;
    }
    .crowd-logo {
color: grey;
    }
`)
    const hashCode = s => s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const cmid = urlParams.get('cmid')
    console.log(cmid)

    var firebaseConfig = {
        apiKey: "AIzaSyCQdRY8WQGHQoP97LIcz8E6XVVxo3BtARE",
        authDomain: "crowdvns.firebaseapp.com",
        projectId: "crowdvns",
        storageBucket: "crowdvns.appspot.com",
        databaseURL: "https://crowdvns-default-rtdb.firebaseio.com",
        messagingSenderId: "587277721428",
        appId: "1:587277721428:web:a963f92c3c1fd8c378b2c1"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    var database = firebase.database();
    console.log(database)
    const q = document.querySelector(".qtext").innerText
    const qHash = hashCode(q)
    const answers = document.querySelector(".answer").children
    const ref = database.ref(cmid).child(qHash)

    const answerNodes = {}
    const voted = {}
// form-inline
    Array.from(document.querySelector(".answer").children).forEach(elem => {
        const answer = elem.innerText
        const aHash = hashCode(answer)
        const input = Array.from(elem.querySelectorAll("input")).filter(l => l.type !== "hidden")[0]
        const label = elem.querySelector("label")
        const sub = document.createElement("sub")
        sub.innerHTML = "loading..."
        sub.classList.add("crowd")
        label.parentNode.insertBefore(sub, label)
        //label.innerHTML = `<sub class="crowd">loading...</sub> ` + label.innerHTML
        answerNodes[aHash] = sub
        input.addEventListener("change", (ev) => {
            const checked = input.checked
            console.log(voted)
            Object.keys(voted).forEach(h => {
                if(aHash == h) {
                    return
                }
                const oldInput = voted[h]
                if(!oldInput.checked) {
                    delete voted[h]
                    ref.child(h)
                        .set(firebase.database.ServerValue.increment(-1))
                }
            })
            if(checked) {
                voted[aHash] = input
            } else {
                delete voted[aHash]
            }


            ref.child(aHash)
                .set(firebase.database.ServerValue.increment(checked ? 1 : -1))
        })
    })

    const process = function(snapshot) {
        console.log("process", answerNodes)
        const value = snapshot.val()
        if(!value) {
            Object.values(answerNodes).forEach(node => {
                node.innerText = `0% (0 voted)`
                node.classList.toggle("valid", false)
            })
            return
        }
        const keys = Object.keys(value)
        //style="color: green; font-weight: 600"
        const total = Object.values(value).reduce((acc, it) => acc + it)
        const max = Math.max(...Object.values(value))

        keys.forEach(key => {
            const val = value[key]
            const percentage = Math.floor((val / total) * 100)
            console.log(key)
            if(!answerNodes[key])return
            answerNodes[key].innerText = `${percentage}% (${val} voted)`
            answerNodes[key].classList.toggle("valid", val === max)
        })

        Object.keys(answerNodes).forEach(key => {
            if(!value[key]) {
                if(!answerNodes[key])return

                answerNodes[key].innerText = `0% (0 voted)`
                answerNodes[key].classList.toggle("valid", false)

                //answerNodes[key].style.color = "initial !important";
                //answerNodes[key].style.fontWeight = "initial !important";
            }
        })
    }
    console.log("dsf")
    ref.on("value", process);
    // Your code here...
})();