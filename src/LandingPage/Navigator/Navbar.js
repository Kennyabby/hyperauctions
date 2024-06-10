import './Navbar.css'
import { FaUser,FaRegUser,FaList } from "react-icons/fa";
import { TfiMenuAlt } from "react-icons/tfi";
import { IoMenu, IoClose, 
    IoChevronDownOutline, 
    IoNotifications,
    IoNotificationsOutline 
} from "react-icons/io5";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useNavigate } from 'react-router-dom';
import navlogo from '../../assets/images/hyperlogo.png'
import { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import ContextProvider from '../../Resources/ContextProvider';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ()=>{
    const location = useLocation()
    const Navigate = useNavigate()
    const [endpoint, setEndpoint] = useState(location)
    const [showMenu, setShowMenu] = useState(false)
    const [yOffset, setYOffset] = useState(window.scrollY)
    const {userRecord, fetchServer,
        server,removeSessions, myBidcount
    } = useContext(ContextProvider)
    const [loggedin, setLoggedin] = useState(false)
    const [logoutStatus, setLogoutStatus] = useState('Log Out')
    const [dropdown, setDropdown] = useState(false)
    useEffect(()=>{
        const pathname = location.pathname
        setEndpoint(pathname.slice(pathname.indexOf('/')+1,))
    },[location])
    useEffect(()=>{
        var sid = window.localStorage.getItem('sessn-id')
        if (sid!==null){
            setLoggedin(true)
        }
    },[userRecord])

    useEffect(()=>{
        window.addEventListener('scroll', updateYOffset)
    },[yOffset])
    const updateYOffset = ()=>{
        setYOffset(window.scrollY)
    }

    const handleNavClick = (e) =>{
        const name = e.target.getAttribute('name')
        if (![null, undefined,'dropdown','logout'].includes(name)){
            Navigate('/'+name)
            setShowMenu(false)
        }
        if (!['dropdown','logout'].includes(name)){
            setDropdown(false)
        }
    }
    const logout = async ()=> {
        setLogoutStatus("Closing Session...")
        const resp = await fetchServer("POST", {
            database: "AuctionDB",
            collection: "UsersBase", 
            record: userRecord
        }, "closeSession", server)
        
        if (resp.err){
            console.log(resp.mess)
        }else{
            // console.log(resp)
            setLogoutStatus("Logged Out")
        }
        setShowMenu(false)
        setDropdown(false)
        removeSessions("")
        window.location.reload()
    }
    return (
        <>
        <div className='navcontainer' onClick={handleNavClick}>
            <div className='navsubbody'>
                <div className='navmenu'>
                    <div className='navlogo' >
                        <img src={navlogo} name='' className='logo'/>
                    </div>
                    <div className='menuicon' onClick={()=>{setShowMenu(!showMenu)}}>
                        {showMenu? <IoClose/> : <IoMenu/>}
                    </div>
                </div>
                <AnimatePresence>
                    {(!showMenu && loggedin) && <motion.div 
                        className={'profilelink userprofilelink extnavigators'+(yOffset>=90?' fixnavigator':'')}
                        initial={{opacity:0}}
                        animate={{opacity:1}}
                        transition={{duration:1.5}}
                        exit={{opacity:0, transition:{duration:.59}}}
                    >
                        <IoIosArrowBack className='backbtn' onClick={()=>{
                            Navigate(-1)
                        }}/>
                        <div className='bids extbids'><b>{myBidcount===null?'...':myBidcount}</b> Bids</div>
                        <div className='profilevisit extprofilevisit'>{![undefined, null].includes(userRecord) ?userRecord.username: '....'}</div>
                        <div className='usericon exticons'><IoNotifications/></div>
                        <div className='usericon exticons'>
                            <FaUser/><IoChevronDownOutline 
                                name='dropdown'
                                className='navoptions'
                                onClick = {()=>{
                                    setDropdown(!dropdown)
                                }}
                            />
                        </div>
                    </motion.div> 
                    }
                    {!loggedin && !showMenu && <motion.div 
                        className='extbidnotify'
                        initial={{opacity:0}}
                        animate={{opacity:1}}
                        transition={{duration:1.5}}
                        exit={{opacity:0, transition:{duration:.59}}}
                        onClick={()=>{
                            Navigate('/Login')
                        }}
                    >
                        {/* <IoIosArrowBack className='backbtn' onClick={()=>{
                            Navigate(-1)
                        }}/> */}
                        Login to make your bids
                    </motion.div>}
                </AnimatePresence>
            </div>

            <div className={'navcon'+(showMenu?'':' mobilenav')}>
                <div className='navbar'>
                    <li name='' className={endpoint === '' ? 'selected': ''}>AUCTIONS</li>
                    <li name='about' className={endpoint === 'about' ? 'selected': ''}>ABOUT US</li>
                    <li name = 'bidding' className={endpoint === 'bidding' ? 'selected': ''}>BIDDING</li>
                    <li name = 'contact' className={endpoint === 'contact' ? 'selected': ''}>CONTACT US</li>
                    
                </div>
                {loggedin && <div name='logout' 
                    className='navlogout'
                    onClick={logout}
                >
                    {logoutStatus}
                </div>}
                <div className='navend'>
                    {loggedin && 
                        <div className={'profilelink userprofilelink navigators'}>
                            <div className='bids'><b>{myBidcount===null?'...':myBidcount}</b> Bids</div>
                            <div className='usericon'><IoNotifications/></div>
                            <div className='usericon'>
                                <FaUser/><IoChevronDownOutline 
                                    name='dropdown'
                                    className='navoptions'
                                    onClick = {()=>{
                                        setDropdown(!dropdown)
                                    }}
                                />
                            </div>
                            {dropdown && <div className='dropdown'>
                                <div><IoNotificationsOutline className='dropicon'/><div className='droplabel'>Notifications</div></div>
                                <div><FaRegUser className='dropicon'/>
                                <div className='droplabel'>Profile</div></div>
                                <div><FaList className='dropicon'/> <div className='droplabel'>History</div></div>
                                <div name='logout' 
                                    className='logout'
                                    onClick={logout}
                                >
                                    {logoutStatus}
                                </div>
                            </div>}
                        </div>
                    }
                    {userRecord===null?
                        <div className='visitview'>
                            <div className='navlogin' name='login'>LOGIN</div>
                            <div className='navsignup' name='signup'>SIGN UP</div>
                        </div> :
                        <div className='profilevisit'>{userRecord.username}</div>
                    }
                </div>
            </div>

        </div>
        </>
    )
}

export default Navbar