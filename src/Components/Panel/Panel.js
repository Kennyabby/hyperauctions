import './Panel.css'
import {useState, useEffect, useRef, useContext} from 'react'
import ContextProvider from '../../Resources/ContextProvider';
import { useNavigate } from 'react-router-dom';
import hyperlogo from '../../assets/images/hyperlogo.png'
import Dashboard from './Dashboard/Dashboard';
import PanelAuctions from './PanelAuctions/PanelAuctions';
import Bidders from './Bidders/Bidders';
import Categories from './Categories/Categories';
import LiveWatcher from './LiveWatcher/LiveWatcher';
import Settings from './Settings/Settings';
import { LuLayoutDashboard } from "react-icons/lu";
import { PiClockCountdownBold } from "react-icons/pi";
import { FaUsers } from "react-icons/fa";
import { FaListCheck } from "react-icons/fa6";
import { IoSettings } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";

const Panel = ()=>{
    const defaultNav = window.localStorage.getItem('currnav')
    const [currNav, setCurrNav] = useState(defaultNav?defaultNav:'dashboard')
    const [panelView, setPanelView] = useState()
    const panelauctRef = useRef(null)
    const {
        storePath, userRecord
    } = useContext(ContextProvider)
    
    useEffect(()=>{
        storePath('admin')
    },[storePath])

    useEffect(()=>{
        if (currNav==='dashboard'){
            setPanelView(<Dashboard/>)
        }
        else if (currNav==='auctions'){
            setPanelView(<PanelAuctions panelauctRef={panelauctRef}/>)
        }
        else if (currNav==='bidders'){
            setPanelView(<Bidders/>)
        }
        else if (currNav==='categories'){
            setPanelView(<Categories/>)
        }
        else if (currNav==='watcher'){
            setPanelView(<LiveWatcher/>)
        }
        else if (currNav==='settings'){
            setPanelView(<Settings/>)
        }
    },[currNav])
    return (
        <>
            <div className='panel'>
                <PanelNav
                    currNav={currNav}
                    setCurrNav={setCurrNav}
                />
                <div></div>
                <div className='panelview'>
                    <div className='welcome'>{`Welcome Back,`} <b>{`${userRecord.firstname} ${userRecord.lastname}`}</b></div>
                    <div className='dashview' ref={panelauctRef}>
                        {panelView}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Panel

const PanelNav = ({currNav, setCurrNav})=>{
    const Navigate = useNavigate()
    const handleNavSelection = (e)=>{
        const name = e.target.getAttribute('name')
        if (![null, undefined].includes(name)){
            setCurrNav(name)
            window.localStorage.setItem('currnav',name)
        }
    }
    return(
        <>
            <div className='panelnav'>
                <div 
                    className='panellogo'
                    onClick={()=>{
                        Navigate('/')
                    }}
                >
                    <img src={hyperlogo} width={'100%'}/>
                </div>
                <div className='sidenav' onClick={handleNavSelection}>
                    <div className={'sidnavitem' + (currNav ==='dashboard' ? ' navselected':'')} name='dashboard'>
                        <LuLayoutDashboard className='sidnavicon' name='dashboard'/>
                        <div name='dashboard'>DASHBOARD</div>
                    </div>
                    <div className={'sidnavitem' + (currNav ==='auctions' ? ' navselected':'')} name='auctions'>
                        <PiClockCountdownBold className='sidnavicon' name='auctions'/>
                        <div name='auctions'>AUCTIONS</div>
                    </div>
                    <div className={'sidnavitem' + (currNav ==='bidders' ? ' navselected':'')} name='bidders'>
                        <FaUsers className='sidnavicon' name='bidders'/>
                        <div name='bidders'>BIDDERS</div>
                    </div>
                    <div className={'sidnavitem' + (currNav ==='categories' ? ' navselected':'')} name='categories'>
                        <FaListCheck className='sidnavicon' name='categories'/>
                        <div name='categories'>CATEGORIES</div>
                    </div>
                    {/* <div className={'sidnavitem' + (currNav ==='watcher' ? ' navselected':'')} name='watcher'>Live Watcher</div> */}
                    <div className={'sidnavitem' + (currNav ==='settings' ? ' navselected':'')} name='settings'>
                        <IoSettings className='sidnavicon' name='settings'/>
                        <div name='settings'>SETTINGS</div>
                    </div>
                    <div className='navlgt'>
                        <LuLogOut className='sidnavicon'/>
                        <div>LOG OUT</div>
                    </div>
                </div>
            </div>
        </>
    )
}
