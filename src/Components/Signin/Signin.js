import "./Signin.css";
import { useEffect, useState, useContext } from "react";
import { HiOutlineLocationMarker} from 'react-icons/hi'
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ContextProvider from '../../Resources/ContextProvider';
import { motion, AnimatePresence } from "framer-motion";
import bidlogo from '../../assets/images/auctionbidlogo.png'

const Signin = () => {
  
  const { server, fetchServer, storePath, 
    setVerificationMail, setVerificationCode, 
  generateCode } = useContext(ContextProvider)
  
  const [field, setField] = useState({
    firstname: "",
    lastname: "",
    contact: "",
    email:"",
    username: "",
    password: "",
  });
  const [signinStatus, setSigninStatus] = useState("SIGN UP")
  const [loginMessage, setLoginMessage] = useState("");
  const [showpass, SetShowpass] = useState(false);
  
  const Navigate = useNavigate()

  useEffect(()=>{
    storePath('signup')
  },[storePath])

  useEffect(()=>{
    setTimeout(()=>{
        if(loginMessage){
            setLoginMessage("")
        }
      },3000)
  },[loginMessage])
  const validateField = ()=>{
    let ct=0
    Object.values(field).forEach((val)=>{
        if (!val){
            ct++
        }
    })
    if(ct){
        setLoginMessage("Kindly Fill All Fields!")
    }else{
        validateSignup()
    }
  }
  const validateSignup = async ()=> {
    setSigninStatus("SIGNING UP...")
    setLoginMessage("")
    const resp = await fetchServer("POST", {
      database: "AuctionDB",
      collection: "UsersBase", 
      update: field
    }, "createDoc", server)

    if (resp.err){
      setLoginMessage(resp.mess)
      setSigninStatus("SIGN UP")
      setTimeout(()=>{
        setLoginMessage("")
      },3000)
    }else{
      if (resp.mess){
        setLoginMessage(resp.mess)
        setSigninStatus("SIGN UP")
        setTimeout(()=>{
          setLoginMessage("")
        },3000)
      }else{
        const resp1 = await fetchServer("POST", {
            database: "Bidder_"+field.username,
            collection: "Profile", 
            update: field
          }, "createDoc", server)
      
          if (resp1.err){
            setLoginMessage(resp1.mess)
            setSigninStatus("SIGN UP")
            setTimeout(()=>{
              setLoginMessage("")
            },3000)
          }else{
            if (resp1.mess){
              setLoginMessage(resp1.mess)
              setSigninStatus("SIGN UP")
              setTimeout(()=>{
                setLoginMessage("")
              },3000)
            }else{
                setVerificationMail(field.email)
                const bodyCode = generateCode()
                setVerificationCode(bodyCode) 
                const message =
                "<h2>Verify your email address by copying the verification code below.</h2><p style='font-family:monospace; font-size: 1rem;'>Hello!,</p><p style='font-family:monospace; font-size: 1rem;'>You are getting this email to confirm that you want to create an account with <b>Bid2Buy</b>.</p><p>Your Verification code is: <b>" +
                bodyCode +
                "</b></p><h2>Not You?</h2><p style='font-family:monospace; font-size: 1rem;'>If this was not you, kindly <a href='https://xdot.vercel.app/help'>click here</a>. </p><p style='margin-top: 50px; font-family:monospace;'>Regards. <b>The  Bid2Buy Support Team</b> in partnership with <b>Hypercity</b>.</p><p style='margin-top: 150px; font-family:monospace'>If you do no want to get future notifications through this email, kindly <a href='https://xdot.vercel.app/help'>stop it here</a>.</p>"

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
                    setSigninStatus("SIGN UP")
                    setTimeout(()=>{
                        setLoginMessage("")
                    },5000)
                }else{
                    if (resp.mess){
                        setLoginMessage(resp.mess)
                        setSigninStatus("SIGN UP")
                        setTimeout(()=>{
                        setLoginMessage("")
                        },5000)
                    }else{
                        setField((field)=>{
                            return({...field, firstname: "",
                                lastname: "",
                                contact: "",
                                email:"",
                                username: "",
                                password: ""
                            })
                        })
                        Navigate('/verify')
                        setSigninStatus("SIGN UP")
                    }
                }
               
            }
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
  };
  return (
    <>
      <div className="signup">
        <div className="signupblock">
          <div className="sgnupabout">
            <div 
                className="sbidlogocover"
                onClick={()=>{
                Navigate('/')
                }}
            >
                <img src={bidlogo} className="sbidlogo"/>
            </div>
            <div className="sgntitle">SIGN UP</div>
            <div className="sgnmsg">
                Already have an account? <label 
                  className="signuplogin"
                  onClick={(()=>{
                    Navigate('/login')
                  })} 
                > Login </label>
              </div>
          </div>
          {loginMessage && <AnimatePresence>
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
          </AnimatePresence>}
          <div className="sgnupcv" onChange={getFieldInput}>
            <div className="inpsgcv">
              <label>FIRST NAME</label>
              <input
                name="firstname"
                placeholder="John"
                type="text"
                className="sgninp"
                defaultValue={field.firstname}
                value={field.firstname}
              />
            </div>
            <div className="inpsgcv">
              <label>LAST NAME</label>
              <input
                name="lastname"
                placeholder="Doe"
                type="text"
                className="sgninp"
                defaultValue={field.lastname}
                value={field.lastname}
              />
            </div>
            <div className="inpsgcv">
              <label>USERNAME</label>
              <input
                name="username"
                placeholder="username"
                type="text"
                className="sgninp"
                defaultValue={field.username}
                value={field.username}
              />
            </div>
            <div className="inpsgcv">
              <label>EMAIL</label>
              <input
                name="email"
                placeholder="johndoe@example.com"
                type="email"
                className="sgninp"
                defaultValue={field.email}
                value={field.email}
              />
            </div>
            <div className="inpsgcv">
              <label>PHONE NUMBER </label>
              <input
                name="contact"
                placeholder="(+123)80***3721"
                type="text"
                className="sgninp"
                defaultValue={field.contact}
                value={field.contact}
              />
            </div>
            <div className="inpsgcv">
              <label>PASSWORD</label>
              <div className="sgnpassbx">
                <input
                  name="password"
                  placeholder="********"
                  type={showpass ? "text" : "password"}
                  className="sgnpassinp"
                  defaultValue={field.password}
                  value={field.password}
                  onKeyDown={(e)=>{
                    if (e.key === "Enter"){
                      validateField()
                    }
                  }}
                />
                <div
                  className="shwpass"
                  onClick={() => {
                    SetShowpass(!showpass);
                  }}
                >
                  {showpass ? <IoEyeOutline /> : <IoEyeOffOutline />}
                </div>
              </div>
            </div>
            <div className="sreminder"><b>Friendly Reminder:</b> You are only entitled to operate ONE account. Violation of this policy may result in suspension of your account and forfeiture of your wins. Please see our Terms of Use.</div>
          </div>
          <div className="sgnbtn">
            <div className="signupbtn"
              onClick={validateField}
            >
              {signinStatus}
            </div>
          </div>
        </div>
        <div className="signupbanner">
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

export default Signin;
