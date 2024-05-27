import "./Login.css";
import { useEffect, useState, useContext } from "react";
import { HiOutlineLocationMarker} from 'react-icons/hi'
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ContextProvider from '../../Resources/ContextProvider';
import { motion, AnimatePresence } from "framer-motion";
import bidlogo from '../../assets/images/auctionbidlogo.png'

const Login = () => {
  const { server, fetchServer, storePath, 
    loginMessage, setLoginMessage, loadPage
  } = useContext(ContextProvider)
  const [field, setField] = useState({
    email: "",
    password: "",
  });
  const [signinStatus, setSigninStatus] = useState("SIGN IN")
  const [showpass, SetShowpass] = useState(false);
  
  const Navigate = useNavigate()

  useEffect(()=>{
    storePath('login')
  },[storePath])
  useEffect(()=>{
    if(loginMessage){
      setTimeout(()=>{
        setLoginMessage("")
      },5000)
    }
  },[loginMessage])
  const validateLogin = async ()=> {
    setSigninStatus("SIGNING IN...")
    setLoginMessage("")
    const resp = await fetchServer("POST", {
      database: "AuctionDB",
      collection: "UsersBase",
      pass: field.password,
      prop: {email: field.email}
    }, "authenticateUser", server)

    if (resp.err){
      setLoginMessage(resp.mess)
      setSigninStatus("SIGN IN")
      setTimeout(()=>{
        setLoginMessage("")
      },5000)
    }else{
      if (resp.mess){
        setLoginMessage(resp.mess)
        setSigninStatus("SIGN IN")
        setTimeout(()=>{
          setLoginMessage("")
        },5000)
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
        setField((field)=>{
          return({...field, email: "", password: ""})
        })
        setSigninStatus("SIGN IN")
        loadPage(idVal, '')
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
      <div className="login">
        <div className="loginblock">
          <div className="lgnabout">
          <div 
            className="mbidlogocover"
            onClick={()=>{
              Navigate('/')
            }}
          >
            <img src={bidlogo} className="mbidlogo"/>
          </div>
            <div className="lgntitle">LOGIN</div>
            <div className="lgnmsg">
                Don't have an account? <label 
                  className="loginsignup"
                  onClick={(()=>{
                    Navigate('/signup')
                  })} 
                > Sign up </label>
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
              <label>PASSWORD</label>
              <div className="lgnpassbx">
                <input
                  name="password"
                  placeholder="********"
                  type={showpass ? "text" : "password"}
                  className="lgnpassinp"
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
            <div className="lgnfg">Forgot Password?</div>
            <div className="lreminder"><b>Friendly Reminder:</b> You are only entitled to operate ONE account. Violation of this policy may result in suspension of your account and forfeiture of your wins. Please see our Terms of Use.</div>
          </div>
          <div className="lgnbtn">
            <div className="signin"
              onClick={validateLogin}
            >
              {signinStatus}
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

export default Login;
