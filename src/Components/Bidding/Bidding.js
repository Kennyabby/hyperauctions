import './Bidding.css'
import ContextProvider from '../../Resources/ContextProvider'
import { useContext, useEffect } from 'react'
const Bidding = ()=>{
    const {storePath, userRecord, currBid, setCurrBid} = useContext(ContextProvider)
    useEffect(()=>{
        setCurrBid(JSON.parse(window.localStorage.getItem('currbid')))        
    },[currBid])
    return(
        <>
            <header className='hheader bidheader'>
                {currBid!==null && <div className='biddingcover'>
                    <div className='biddetails'>
                        <img src={currBid.src} className='bidimg'/>
                        <div className='bidname'>{currBid.name}</div>
                        <div className='biddesc'>{currBid.description}</div>
                        <div className='bidbtn'>LIVE</div>
                    </div>
                    <div className='bidentry'>
                        <div className='bidentrytitle'>
                            <div className='entrycardlabel'>CURRENT BID VALUE</div>
                            <div className='entrytitle'>{'$'+currBid.initialprice}</div>
                        </div>
                        <div className='userbidcard'>
                            <label>Enter Your Bid</label>
                            <input 
                                className='lgninp bidinp'
                                type='number'
                                placeholder={'$'+currBid.initialprice}
                            />
                            <div className='userbidbtn'>MAKE YOUR BID</div>
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