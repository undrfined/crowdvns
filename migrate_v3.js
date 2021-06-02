// Migrate to trimmed question hashes (v1.3.0)

const refOld = database.ref("questions_v2")
const refNew = database.ref("questions_v3")
refOld.get().then((snapshot) => {
    const val = snapshot.val()
    Object.keys(val).forEach(cmid => {
        const ques = val[cmid]
        console.group(cmid)
        Object.keys(ques).forEach(async qHash => {
            const q = ques[qHash]
            const newHash = await hashCode(q.data.question)
            val[cmid][newHash] = q;
            // console.log(q.data.question)
        })
        console.groupEnd()
    })
    console.log(val)
    refNew.set(val);
})
