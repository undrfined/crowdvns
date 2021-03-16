'use strict';

const VERSION = "1.0";
console.log("LOADED")

const addLogos = () => {

}
const cr = (tag, inner = null, className = "") => {
    const $elem = document.createElement(tag)
    $elem.innerHTML = inner
    className && $elem.classList.add(className)
    return $elem
}

const validIcon = () => {
    //<i class="icon fa fa-check text-success fa-fw " title="Правильно" aria-label="Правильно"></i>
    const $icon = cr("i", "", "icon")
    $icon.classList.add("fa", "fa-check", "text-success", "fa-fw")
    return $icon
}

const hashCode = async s => {
    const hash = sha256.create();
    hash.update(s);
    return hash.hex();
}

const firebaseConfig = {
    apiKey: "AIzaSyCQdRY8WQGHQoP97LIcz8E6XVVxo3BtARE",
    authDomain: "crowdvns.firebaseapp.com",
    projectId: "crowdvns",
    storageBucket: "crowdvns.appspot.com",
    databaseURL: "https://crowdvns-default-rtdb.firebaseio.com",
    messagingSenderId: "587277721428",
    appId: "1:587277721428:web:a963f92c3c1fd8c378b2c1"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

const $usertext = document.querySelector(".usertext")

const isView = /\/quiz\/view/.test(window.location.pathname)
if(isView) {
    const cmid = new URLSearchParams(window.location.search).get('id')

    const $quizinfo = document.querySelector(".quizinfo")
    $quizinfo.appendChild(cr("p", "Test"))
    const ref = database.ref("questions_v2").child(cmid)

    ref.on("value", (snapshot) => {
        $quizinfo.innerText = "Total questions answered: " + Object.values(snapshot.val()).reduce((acc, el) => el.answers ? acc + 1 : acc, 0)
    })

    return
}

const cmid = new URLSearchParams(window.location.search).get('cmid')
const username = $usertext.innerText
const uid = document.querySelector(".logininfo a").href.match(/id=(.+)/)[1]

const usersRef = database.ref("users")
usersRef.child(uid).set(username)
let users = null
const updateAllStatus = []
usersRef.on("value", (snapshot) => {
    users = snapshot.val()
    updateAllStatus.forEach(l => l())
})

const DEBUG = true

const manifest = chrome.runtime.getManifest()
const $crowdLogo = cr("sub", ` ${manifest.name} v${VERSION}`, "crowd-logo")
document.querySelector(".site-name").appendChild($crowdLogo)
const $logo = document.querySelector(".logo img")
$logo && ($logo.src = chrome.runtime.getURL("images/preview.png"))

// database.ref("version").on("value", (snapshot) => {
//     const val = snapshot.val()
//     if(val) {
//         const split = val.split(".")
//         const currentSplit = VERSION.split(".")
//         let newVersion = false
//         let localNewVersion = false
//         split.forEach((k, i) => {
//             if (k > currentSplit[i]) {
//                 newVersion = true
//             } else if(currentSplit[i] > k) {
//                 localNewVersion = true
//             }
//         })
//         if(localNewVersion) {
//             database.ref("version").set(VERSION)
//         }
//         if (newVersion) {
//             $crowdLogo.innerHTML = ` <a href="https://t.me/crowdvns" target="_blank">New version available!</a>`
//         }
//     }
// })

const submit = () => document.querySelector(".submitbtns input").click()
const $ques = Array.from(document.querySelectorAll(".que"))
const ref = database.ref("questions_v2").child(cmid)

const $total = cr("p", "Total questions answered: loading...")
const $navblock = document.querySelector("#mod_quiz_navblock .card-body")
$navblock.appendChild($total)
ref.on("value", (snapshot) => {
    $total.innerText = "Total questions answered: " + Object.values(snapshot.val()).reduce((acc, el) => el.answers ? acc + 1 : acc, 0)
})

$ques.forEach(async ($que) => {
    const startTime = performance.now()
    let endTime = null
    let loaded = false
    let voters = []

    const $total = cr("div", "loading...", "state")
    const $info = $que.querySelector(".info")
    const $formulation = $que.querySelector(".formulation")
    $info.appendChild($total)

    const $files = cr("details", "<summary>Files</summary>")

    const question = $que.querySelector(".qtext").innerText
    const qHash = await hashCode(question)
    const qRef = ref.child(qHash)
    const dataRef = qRef.child("data")

    const $status = cr("div", "", "dHash")

    const updateStatus = () => {
        let id = "id: " + qHash.substr(0, 4) + "..." + qHash.substr(qHash.length - 4, 4)
        let votersNames = Array.from(voters).map(voter => users[voter] || "Unknown").join(", ")
        let loadedTime = "loaded in " + Math.floor((endTime - startTime)/100)/10 + "s!"
        let loading = loaded ? loadedTime + "\n" + voters.length + " voters: " + votersNames : "loading"
        $status.innerText = `${loading} | ${id}`
    }

    updateAllStatus.push(updateStatus)

    if(DEBUG) {
        $formulation.appendChild($status)
        updateStatus()
    }

    const answersRef = qRef.child("answers")
    const filesRef = qRef.child("files")
    const verifiedRef = qRef.child("verified")


    // const updateAllText = () => {
    //     bigInputs.forEach(({ref, $input}) => {
    //         ref.child(uid).set(username + ": " + $input.value)
    //     })
    // }

    const updateAll = () => {
        answers.forEach(({ref, $input}) => {
            ref.child(uid).set($input.checked)
        })
    }

    const $attachments = $formulation.querySelector(".attachments")
    if($attachments) {
        $formulation.appendChild($files)

        const observer = new MutationObserver(function (mutations) {
            Array.from($attachments.querySelectorAll(".fp-file")).forEach((file, i) => {
                file.click()
                document.querySelector(".fp-file-download").click()
                const $iframe = document.body.children[document.body.children.length - 1]
                const src = $iframe.src
                $iframe.parentNode.removeChild($iframe)
                document.querySelector(".closebutton").click()
                fetch(src).then(res => {
                    return res.blob()
                }).then((blob) => {
                    const task = storage.ref(`${cmid}/${qHash}/${i}`).put(blob)
                    task.on('state_changed', () => {
                    }, () => {
                    }, () => {
                        filesRef.child(uid).child(i).set(task.snapshot.ref.fullPath)
                        task.snapshot.ref.getDownloadURL().then((downloadURL) => {
                            console.log('File available at', downloadURL);
                        });
                    })
                    // filesRef.child(uid).put(blob)
                })
            })
        });

        observer.observe($attachments, {
            attributes: false,
            childList: true,
            characterData: false,
            subtree: true
        });
    }

    let answers = (await Promise.all(Array.from($que.querySelectorAll(".answer label"))
        .map(async l => {
            const verified = !!l.parentNode.querySelector(".fa-check")
            const $copy = l.cloneNode(true)
            const $answernumber = $copy.querySelector(".answernumber")

            $answernumber && $answernumber.parentNode.removeChild($answernumber)

            const text = $copy.innerText
            const hash = await hashCode(text)
            const $input = l.parentNode.querySelector("input:not([type='hidden'])")
            if(verified) {
                verifiedRef.child(hash).set(true)
            }

            if($input) {
                $input.addEventListener("change", updateAll)


                return {
                    hash,
                    text,
                    $input,
                    ref: answersRef.child(hash),
                    verified: (verified) => {
                        if(verified) {
                            if(!l.querySelector("valid_" + hash)) {
                                const $icon = validIcon()
                                $icon.id = "valid_" + hash
                                l.appendChild($icon)
                            }
                        } else {
                            const $prev = l.querySelector("valid_" + hash)
                            if($prev) {
                                $prev.parentNode.removeChild($prev)
                            }
                        }
                    },
                    update: (voted, total, isValid) => {
                        const percentage = Math.floor((voted / total) * 100)

                        $input.parentElement.style.setProperty('--progress', percentage + '%');
                        if (isValid) {
                            $input.parentElement.style.setProperty("--color", "rgba(92, 184, 92, 0.2)")
                        } else {
                            $input.parentElement.style.removeProperty("--color")
                        }
                    }
                };
            }
        }))).filter(Boolean)


    answers = [...answers, ...await Promise.all(Array.from($que.querySelectorAll("table.answer tr")).map(async l => {
        const text = l.querySelector("td.text").innerText
        const hash = await hashCode(text)
        const $select = l.querySelector("select")
        const ref = answersRef.child(hash)
        const $options = Array.from(l.querySelectorAll("option"))
        $options.forEach(q => {
            q.dataset.text = q.innerText
            q.appendChild(cr("i", "", "fa-check"))
        })
        $select.addEventListener("change", () => {
            ref.child(uid).set($select.options[$select.selectedIndex].dataset.text)
        })
        console.log($select)
        if($select.parentNode.querySelector(".fa-check")) {
            verifiedRef.child(hash).set($select.options[$select.selectedIndex].dataset.text)
        }

        return {
            hash,
            text,
            ref,
            verified: (verified) => {
                             // TODO
            },
            update: (voted, total, isValid, answers) => {
                $options.forEach(q => {
                    const text = q.dataset.text
                    let ss = 0
                    const total = Object.keys(answers).length
                    Object.keys(answers).forEach(key => {
                        const value = answers[key]
                        if(value === text) {
                            ss++
                        }
                    })
                    const percentage = Math.floor((ss/total) * 100)
                    q.innerText = q.dataset.text + ` | ${isNaN(percentage) ? 0 : percentage}%`
                })

            }
        }
    }))]

    //
    const textboxes = Array.from($que.querySelectorAll(".formulation input[type='text'], .formulation div[role='textbox']"))
    answers = [...answers, ...textboxes
        .map(($input, i) => {
            let $container = $formulation
            if(textboxes.length > 1) {
                $container = cr("details")
                $container.appendChild(cr("summary", "q" + i))
                $formulation.appendChild($container)
            }

            if($input.parentNode.querySelector(".fa-check")) {
                verifiedRef.child(i).set($input.innerHTML || $input.value)
            }

            const ref = answersRef.child(i)
            $input.addEventListener("input", () => {
                ref.child(uid).set($input.innerHTML || $input.value)
            })

            // const text = $input.value
            // const $crowd = cr("div", "loading...", "crowd")
            // $input.parentNode.parentNode.parentNode.appendChild($crowd)
            // $input.addEventListener("change", updateAllText)
            //
            return {
                $input,
                ref,
                hash: i,
                verified: (verified) => {
                    const $answers = cr("details")
                    $answers.open = true
                    $answers.id = "zza_" + qHash + "_" + i
                    $answers.appendChild(cr("summary", "VERIFIED " + validIcon().outerHTML))
                    const $text = cr("div", verified, "editor_atto_content_wrap")
                    $text.style.overflowWrap = "break-word"
                    $answers.appendChild($text)
                    $container.appendChild($answers)
                },
                update: (voted, total, isValid, answers) => {
                    if(answers) {
                        Object.keys(answers).forEach((user) => {
                            const username = users[user]
                            const html = answers[user]
                            let $answers = document.querySelector("#" + "zz_" + qHash + "_" + i + "_" + user + " .editor_atto_content_wrap")
                            if (!$answers) {
                                if(html) {
                                    $answers = cr("details")
                                    $answers.open = true
                                    $answers.id = "zz_" + qHash + "_" + i + "_" + user
                                    $answers.appendChild(cr("summary", username))
                                    const $text = cr("div", html, "editor_atto_content_wrap")
                                    $text.style.overflowWrap = "break-word"
                                    $answers.appendChild($text)
                                    $container.appendChild($answers)
                                }
                            } else {
                                if(!html) {
                                    $answers.parentNode.parentNode.removeChild($answers.parentNode)
                                } else {
                                    $answers.innerHTML = html
                                }
                            }
                        })
                    }

                }
            }
        })]

    dataRef.set({
        html: $que.innerHTML,
        question,
    })

    const processFiles = (snapshot) => {
        const value = snapshot.val()
        if(value) {
            Object.keys(value).forEach(user => {
                const fileRefs = value[user]
                fileRefs.forEach((fileRef, i) => {
                    storage.ref(fileRef).getDownloadURL().then(url => {
                        const $a = document.querySelector("#a" + fileRef.replace(/\//g, "_"))
                        if ($a) {
                            $a.href = url
                        } else {
                            const $a = cr("a", users[user] + " / " + i)
                            $a.href = url
                            $a.id = "a" + fileRef.replace(/\//g, "_")
                            $a.target = "_blank"
                            $files.appendChild($a)
                        }
                    })
                })
            })
        }
    }

    const processVerified = (snapshot) => {
        const value = snapshot.val()
        if(!value) return

        answers.forEach(({hash, verified}) => {
            const k = value[hash]
            if(!k) {
                return
            }
            // console.log("VERIFIED", hash, k)
            verified(k)
            // update(count, total, count === total, k)
        })
    }

    const process = (snapshot) => {
        const value = snapshot.val()
        $formulation.style.setProperty("--formulation-bg", "#def2f8")

        loaded = true
        const allVoted = new Set()
        if(value) {
            Object.values(value).forEach((k) => Object.keys(k).forEach(l => allVoted.add(l)))
        }
        voters = Array.from(allVoted)
        if(!endTime) {
            endTime = performance.now()
        }

        updateStatus()


        if(!value) {
            $total.innerText = "Nobody has answered this question yet."
            answers.forEach(({update}) => {
                update(0, 0, false)
            })
            // bigInputs.forEach(({$crowd}) => {
            //     $crowd.innerText = `No answers yet.`
            // })
            return
        }
        $total.innerText = `Loaded!`

        const total = Object.values(value).reduce((acc, it) => acc + Object.values(it).filter(Boolean).length, 0)

        answers.forEach(({hash, update}) => {
            const k = value[hash]
            if(!k) {
                update(0, 1, false, {})
                // TODO
                // $crowd.innerText = `Unknown answer?`
                // No answer found?
                return
            }
            const count = Object.values(k).filter(Boolean).length

            update(count, total, count === total, k)
        })
    }

    answersRef.on("value", process)
    filesRef.on("value", processFiles)
    verifiedRef.on("value", processVerified)
})

