import './Verify.css'
import { useEffect, useState, useContext } from "react";
import { FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import ContextProvider from '../../Resources/ContextProvider';
import { motion, AnimatePresence } from "framer-motion";
import bidlogo from '../../assets/images/auctionbidlogo.png'

const Verify = () => {
  const { server, fetchServer, storePath,
    verificationMail, verificationCode,loadPage,userRecord,
    setVerificationCode, generateCode,setVerificationMail
  } = useContext(ContextProvider)
  const [countDownId,setCountDownId] = useState(null)
  const [spanLeft, setSpanLeft] = useState(null)
  const [verificationMessage, SetVerificationMessage] = useState('Thanks for signing up! An email was sent to activate your account')
  const [field, setField] = useState({
    email: "",
    code: "",
  });
  const [loginMessage, setLoginMessage] = useState("")
  const [verifyStatus, setVerifyStatus] = useState("VERIFY")
  
  const Navigate = useNavigate()

  useEffect(()=>{
    storePath('verify')
  },[storePath])
  useEffect(()=>{
    if(verificationMail!==null){
        setField((field)=>{
            return {...field, email:verificationMail}
        })
    }
  },[verificationMail])
  useEffect(()=>{
    if(loginMessage){
      setTimeout(()=>{
        setLoginMessage("")
      },5000)
    }
  },[loginMessage])
  const validateLogin = async ()=> {
    setVerifyStatus("VERIFYING...")
    if(field.code===verificationCode){
        SetVerificationMessage("")
        setVerifyStatus("VERIFYING...")
        const resps = await fetchServer("POST", {
            database: "AuctionDB",
            collection: "UsersBase", 
            prop: [{email: userRecord.email}, {verified:true}]
        }, "updateOneDoc", server)

        if (resps.err){
            setLoginMessage(resps.mess)
            // console.log(resps.mess)
        }else{
            if (resps.updated){
                const resps1 = await fetchServer("POST", {
                    database: "Bidder_"+userRecord.username,
                    collection: "Profile", 
                    prop: [{email: userRecord.email}, {verified:true}]
                }, "updateOneDoc", server)
                if (resps1.err){
                    setLoginMessage(resps1.mess)
                }else{
                    if(resps1.updated){
                        SetVerificationMessage("Thank You. Email Verified Successfully!")
                        setVerifyStatus("VERIFY")
                        setTimeout(()=>{
                            Navigate('/')
                        },3000)
                    }else{
                        setLoginMessage("Service error. No cause for alarm. Kindly try again!")
                        setVerifyStatus("VERIFY")
                    }
                }
            }else{
                setLoginMessage("Service error. No cause for alarm. Kindly try again!")
                setVerifyStatus("VERIFY")
            }
        }
    }else{
        setLoginMessage("Code Not Valid!")
        setVerifyStatus("VERIFY")
    }
    
  }

  const countDown = (time) => {
    setSpanLeft(time)
    const countDownId = setInterval(() => {
      setSpanLeft((spanLeft) => {
        if (spanLeft != 0) {
          return spanLeft - 1
        }
        return time
      })
    }, 1000)
    setCountDownId(countDownId)
  }
  useEffect(() => {
    if (spanLeft === 0) {
      clearInterval(countDownId)
      setSpanLeft(null)
    }
  }, [spanLeft])

  const resendCode = async()=>{
    if (spanLeft===null){
        setVerifyStatus('SENDING CODE...')
        SetVerificationMessage("")
        const bodyCode = generateCode()
        setVerificationCode(bodyCode) 
        const message =
        "<h2>Verify your email address by copying the verification code below.</h2><p style='font-family:monospace; font-size: 1rem;'>Hello!,</p><p style='font-family:monospace; font-size: 1rem;'>You are getting this email to validate your identity with <b>Bid2Buy</b>.</p><p>Your Verification code is: <b>" +
        bodyCode +
        "</b></p><h2>Not You?</h2><p style='font-family:monospace; font-size: 1rem;'>If this was not you, kindly <a href='https://xdot.vercel.app/help'>click here</a>. </p><p style='margin-top: 50px; font-family:monospace;'>Regards. <b>The Bid2Buy Support Team</b> in partnership with <b>Hypercity</b>.</p><p style='margin-top: 150px; font-family:monospace'>If you do no want to get future notifications through this email, kindly <a href='https://xdot.vercel.app/help'>stop it here</a>.</p>"
    
        const detailsVal = {
            to: [field.email],
            type: 'html',
            subject: 'Verify your account on Bid2Buy',
            message: message,
        }
        const resp = await fetchServer("POST", {
            details: detailsVal
        }, "mailUser", server)
    
        if (resp.err){
            setLoginMessage(resp.mess)
            setVerifyStatus("VERIFY")
            setTimeout(()=>{
                setLoginMessage("")
            },5000)
        }else{
            if (resp.mess){
                setLoginMessage(resp.mess)
                setVerifyStatus("VERIFY")
                setTimeout(()=>{
                setLoginMessage("")
                },5000)
            }else{
                SetVerificationMessage(<label>Verification code has been resent to your email address. Kindly check your <b>"Spam"</b> or <b>"Promotions"</b> folder if not seen</label>)
                setVerifyStatus("VERIFY")
                countDown(60)
            }
        }
    }
  }
 
  const getFieldInput = (e) => {
    const name = e.target.getAttribute("name");
    const value = e.target.value;
    setField((field) => {
      return { ...field, [name]: value };
    });
    if (name==='email'){
        setVerificationMail(value)
    }
  };
  return (
    <>
      <div className="login">
        <div className="loginblock verifyblock">
          <div className="lgnabout">
          <div 
            className="mbidlogocover"
            onClick={()=>{
              Navigate('/')
            }}
          >
            <img src={bidlogo} className="mbidlogo"/>
          </div>
            <div className="lgntitle">VERIFY</div>
            <div className="lgnmsg">
                Already Verified? <label 
                  className="loginsignup"
                  onClick={(()=>{
                    Navigate('/login')
                  })} 
                > Login </label>
              </div>
          </div>
          <AnimatePresence>
            {loginMessage && 
              <motion.div 
                initial={{opacity:0}}
                animate={{opacity:1}}
                transition={{
                  opacity: {
                    duration: 0.5,
                    ease: 'easeIn'
                  },
                }}
                exit={{opacity: 0, transition:{opacity:{
                  duration: 0.5,
                  ease: 'easeOut',
                }}}}
                className="errmsgs"
              >
                {loginMessage}
              </motion.div>
            }
            {(verificationMail!==null && verificationMessage) &&
                <motion.div initial={{opacity:0}}
                    animate={{opacity:1}}
                    transition={{
                        opacity: {
                            duration: .8,
                            ease: 'easeIn'
                        },
                    }}
                    exit={{opacity: 0, transition:{opacity:{
                        duration: 0.8,
                        ease: 'easeOut',
                    }}}}
                    
                    className='verifymsg'>
                    <FaCircleCheck className='verifycheck'/>
                    <div>{verificationMessage}</div>
                </motion.div>
            }
          </AnimatePresence>

          <div className="lgninpcv" onChange={getFieldInput}>
            <div className="inplgcv">
              <label>ENTER EMAIL ADDRESS</label>
              <input
                name="email"
                placeholder="johndoe@example.com"
                type="email"
                className="lgninp"
                defaultValue={field.email}
                value={field.email}
              />
            </div>
            <div className="inplgcv">
              <label>CODE</label>
              <input
                name="code"
                placeholder="123456"
                type="number"
                className="lgninp"
                defaultValue={field.code}
                value={field.code}
              />
            </div>
            <div className="lreminder">Enter the verification code sent to you.</div>
            <div className="lgnfg" onClick={resendCode}>{spanLeft===null?'Resend Code':('Resend code in '+spanLeft+'s')}</div>
          </div>
          <div className="lgnbtn">
            <div className="signin"
              onClick={validateLogin}
            >
              {verifyStatus}
            </div>
          </div>
        </div>
        <div className="loginbanner">
          <div 
            className="bidlogocover"
            onClick={()=>{
              Navigate('/')
            }}
          >
            <img src={bidlogo} className="bidlogo"/>
          </div>
        </div>
      </div>
    </>
  );
};

export default Verify;
