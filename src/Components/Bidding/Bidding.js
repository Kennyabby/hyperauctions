import './Bidding.css'
import ContextProvider from '../../Resources/ContextProvider'
import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
const Bidding = ()=>{
    const {storePath, userRecord, currBid, setCurrBid, setLoginMessage} = useContext(ContextProvider)
    const Navigate = useNavigate()
    useEffect(()=>{
        setCurrBid(JSON.parse(window.localStorage.getItem('currbid')))        
    },[])
    useEffect(()=>{
        storePath('bidding')
    },[storePath])
    const  makeBid = ()=>{
        if(userRecord===null){
            Navigate('/login')
            setLoginMessage("Kindly Login to Make Your Bid")
        }
    }
    return(
        <>
            <header className='hheader bidheader'>
                {currBid!==null && <div className='biddingcover'>
                    <div className='biddetails'>
                        <img src={currBid.src} className='bidimg'/>
                        <div className='bidname'>{currBid.name}</div>
                        <div className='biddesc'>{currBid.description}</div>
                        <div className='bidlive'>LIVE</div>
                        <div className='bidbase'>
                            <div className='bidbrand'>{currBid.brand}</div>
                        </div>
                    </div>
                    <div className='bidentry'>
                        <div className='bidentrytitle'>
                            <div className='entrycardlabel'>HIGHEST BID SO FAR</div>
                            <div className='entrytitle'>{'$'+currBid.initialprice}</div>
                        </div>
                        <div className='userbidcard'>
                            <label>WHAT'S YOUR BID?</label>
                            <input 
                                className='lgninp bidinp'
                                type='number'
                                placeholder={'$'+currBid.initialprice}
                            />
                            <div className='userbidbtn' onClick={makeBid}>BID NOW</div>
                        </div>
                    </div>
                </div>}
            </header>
            <main className='main bidmain'></main>
            <footer className='footer'></footer>
        </>
    )
}

export default Bidding