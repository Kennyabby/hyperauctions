import './Navbar.css'
import { FaUser } from "react-icons/fa";
import { TfiMenuAlt } from "react-icons/tfi";
import { IoMenu, IoClose, IoChevronDownOutline, IoNotifications } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import navlogo from '../../assets/images/hyperlogo.png'
import { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import ContextProvider from '../../Resources/ContextProvider';

const Navbar = ()=>{
    const location = useLocation()
    const Navigate = useNavigate()
    const [endpoint, setEndpoint] = useState(location)
    const [showMenu, setShowMenu] = useState(false)
    const {userRecord} = useContext(ContextProvider)
    useEffect(()=>{
        const pathname = location.pathname
        setEndpoint(pathname.slice(pathname.indexOf('/')+1,))
    },[location])
    useEffect(()=>{
        console.log(userRecord)
    },[userRecord])
    const handleNavClick = (e) =>{
        const name = e.target.getAttribute('name')
        if (![null, undefined].includes(name)){
            Navigate('/'+name)
        }
    }
    return (
        <>
        <div className='navcontainer' onClick={handleNavClick}>
            <div className='navmenu'>
                <div className='navlogo' >
                    <img src={navlogo} name='' className='logo'/>
                </div>
                <div className='navicon' onClick={()=>{setShowMenu(!showMenu)}}>
                    {showMenu? <IoClose/> : <IoMenu/>}
                </div>
            </div>

            <div className={'navcon'+(showMenu?'':' mobilenav')}>
                <div className='navbar'>
                    <li name='' className={endpoint === '' ? 'selected': ''}>AUCTIONS</li>
                    <li name='about' className={endpoint === 'about' ? 'selected': ''}>ABOUT US</li>
                    <li name = 'bidding' className={endpoint === 'bidding' ? 'selected': ''}>BIDDING</li>
                    <li name = 'contact' className={endpoint === 'contact' ? 'selected': ''}>CONTACT US</li>
                </div>
                <div className='navend'>
                    <div className={'profilelink'+(userRecord!==null?' userprofilelink':'')}>
                        <div className='bids'>0 Bids</div>
                        {userRecord!==null&&<div className='usericon'><IoNotifications/></div>}
                        <div className='usericon'>
                            <FaUser/><IoChevronDownOutline/>
                        </div>
                    </div>
                    {userRecord==null ?
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