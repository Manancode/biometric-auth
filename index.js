const { randomUUID } = require("crypto")
const express = require("express")
const {generateRegistrationOptions, verifyAuthenticationResponse} = require("@simplewebauthn/server")
const cors = require("cors")
const crypto = require("node:crypto")

if(!globalThis.crypto){
    globalThis.crypto = crypto
}

const app = express()
app.use(cors())
app.use(express.static('./public'))
app.use(express.json())

const userStore = {}

app.post("/signup" , (req,res)=>{
    const {username , password} = req.body
    const id = randomUUID()

    const user = {
        id ,
        username ,
        password
    }

    userStore[id] = user
    console.log("resgistered successffuly") 
    return res.json({id})
})

app.post("/register-challenge" , async (req,res)=>{
    const {userid} = req.body
    const user = userStore[userid];
    if (!userStore[userid]) return res.status(404).json({error : "user not found"})
    const registrationOptions = await generateRegistrationOptions({
    rpName : "example.com",
    rpId : "example.com",
    userName : user.username,
    })

    userStore[userid] = registrationOptions.challenge

    return res.json({
            options: registrationOptions
    })

})


app.post("/register-verify" , async(req,res)=>{
    const {userid , cred} = req.body
    const user = userStore[userid]
    const challenge = challengeStore[userid]

    const verificationresult = await verifyAuthenticationResponse({
        expectedChallenge: challenge,
        expectedOrigin:"http://localhost:3000",
        expectedRPID: "example.com",
        response: cred
    })
    if (verificationresult === "valid") {
        userStore[userid].passkey = verificationresult.registrationInfo
        console.log("user verified")
        return res.json({message : "user verified"})
        } else {   
            return res.status(401).json({error : "invalid credentials"})
            }

            })


app.listen(3000 , ()=>{
    console.log("server is running on port 3000")
})  