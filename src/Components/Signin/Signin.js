import "./Signin.css";
import { useEffect, useState, useContext } from "react";
import { HiOutlineLocationMarker} from 'react-icons/hi'
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ContextProvider from '../../Resources/ContextProvider';
import { motion, AnimatePresence } from "framer-motion";
import bidlogo from '../../assets/images/auctionbidlogo.png'

const Signin = () => {
  const { server, fetchServer, storePath } = useContext(ContextProvider)
  const [field, setField] = useState({
    firstname: "",
    lastname: "",
    contact: "",
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
  const validateLogin = async ()=> {
    setSigninStatus("SIGNING UP...")
    setLoginMessage("")
    const resp = await fetchServer("POST", {
      database: "UsersModule",
      collection: "users_db", 
      pass: field.password,
      prop: {username: field.username}
    }, "authenticateUser", server)

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
        var idVal = resp.id
        var now = Date.now()
        var sess = 0
        idVal.split('').forEach((chr)=>{
          sess += chr.codePointAt(0)
        })
        
        window.localStorage.setItem('sess-recg-id', now * sess)
        window.localStorage.setItem('idt-curr-usr', now)
        window.localStorage.setItem('sess-id', idVal)
        window.location.href ="/dashboard"
        setField((field)=>{
          return({...field, userId: "", password: ""})
        })
        setSigninStatus("SIGN UP")
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
                      validateLogin()
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
              onClick={validateLogin}
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
