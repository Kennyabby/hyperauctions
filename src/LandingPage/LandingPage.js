import './LandingPage.css'
import { useContext, useEffect, useState } from 'react'
import Navbar from './Navigator/Navbar'
import Auctions from './Auctions'
import ContextProvider from '../Resources/ContextProvider'
import { Navigate, useNavigate } from 'react-router-dom'
import { TfiLayoutGrid3Alt } from "react-icons/tfi";
import { FaList } from "react-icons/fa6";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import banner1 from '../assets/images/bannerimages/banner1.jpg'
import banner2 from '../assets/images/bannerimages/banner2.jpg'
import banner3 from '../assets/images/bannerimages/banner3.jpg'
import banner4 from '../assets/images/bannerimages/banner4.jpg'

const LandingPage = ()=> {
    const {storePath, userRecord, setLoginMessage, 
        setCurrBid, auctionItems, auctionImages 
    } = useContext(ContextProvider)
    const Navigate = useNavigate()
    const [currFeature, setCurrFeature] = useState('tvs')
    const [currAuction, setCurrAuction] = useState('live')
    const [viewStyle, stViewStyle] = useState('grid')
    useEffect(()=>{
        storePath('')
    },[storePath])     
    useEffect(()=>{
        // console.log(auctionItems)
    },[auctionItems])
    const startBidding = (auction)=>{
        window.localStorage.setItem('curbid',JSON.stringify(auction))
        if(userRecord!==null){            
            setCurrBid(auction)
            Navigate('/bidding')
            document.body.scrollTop = 0; 
            document.documentElement.scrollTop = 0
        }else{
            setLoginMessage("Kindly Login to Continue Bidding")
            Navigate('/login')
            document.body.scrollTop = 0; 
            document.documentElement.scrollTop = 0
        }
    }
    const handleFeatureSelection = (e)=>{
        const name = e.target.getAttribute('name')
        if (![undefined,null].includes(name)){
            setCurrFeature(name)
        }
        
    }
    const handleAuctionTypeSelection = (e)=>{
        const name = e.target.getAttribute('name')

    }
    return (
        <>
            <header className='hheader'>
                <Carousel autoPlay 
                    infiniteLoop 
                    stopOnHover={false} 
                    interval={5000} 
                    showArrows
                    showThumbs={false}
                    useKeyboardArrows={true}
                    transitionTime={1000} 
                    selectedItem={0} 
                >
                    <div className='banner'>
                        <img alt='bannerimg' className='bannerimg' src={banner1}/>
                    </div>
                    <div className='banner'>
                        <img alt='bannerimg' className='bannerimg' src={banner2}/>
                    </div>
                    <div className='banner'>
                        <img alt='bannerimg' className='bannerimg' src={banner3}/>
                    </div>
                    <div className='banner'>
                        <img alt='bannerimg' className='bannerimg' src={banner4}/>
                    </div>
                </Carousel>
            </header>
            <main className='main bidmain'>
                <div className='featured'>
                    <div className='sectiontitle'>Featured Auction Items</div>
                    <div className='featuredcont'>
                        <div className='featuredsection' onClick={handleFeatureSelection}>
                            <div name='jewelry' className={currFeature === 'jewelry' ? 'selected' : ''}>Jewelries</div>
                            <div name='relics' className={currFeature === 'relics' ? 'selected' : ''}>Relics</div>
                            <div name='arts' className={currFeature === 'arts' ? 'selected' : ''}>Arts</div>
                            <div name='tvs' className={currFeature === 'tvs' ? 'selected' : ''}>Tvs</div>
                            <div name='coushions' className={currFeature === 'coushions' ? 'selected' : ''}>Coushions</div>
                            <div name='shoes' className={currFeature === 'shoes' ? 'selected' : ''}>Shoes</div>
                            <div name='watches' className={currFeature === 'watches' ? 'selected' : ''}>Watches</div>
                        </div>
                        <br className='break'/>
                        <div className='featuredbox'>
                            {auctionItems.length ? auctionItems.filter((feature)=>{
                                return feature.type===currFeature
                            }).slice(0,4).map((auction, index)=>{
                                return (
                                    <div className='featurecard' key={index}>
                                        <img src={auctionImages[auction.src]} className='featureimg'/>
                                        <div className='featurename'>{auction.name}</div>
                                        <div className='featuredesc'>{auction.description}</div>
                                    </div>
                                )
                            }):<div></div>
                        }
                        </div>
                    </div>
                </div>
                <div className='auctions'>
                    <div className='sectiontitle'>Bid2Buy Live Auctions For You</div>
                    <div className='auctioncont'>
                        <div className='auctionsection' onClick={handleAuctionTypeSelection}>
                            {/* <div name='all'  className={currAuction === 'all' ? 'selected' : ''}>All</div> */}
                            <div name='live' className={currAuction === 'live' ? 'selected' : ''}>Live Auctions</div>
                            {userRecord!==null && <div name='userbid' className={currAuction === 'userbid' ? 'selected' : ''}>Your Bids</div>}
                            {/* <div name='buy' className={currAuction === 'buy' ? 'selected' : ''}>Buy Now</div> */}
                        </div>
                        <br className='break'/>
                    </div>
                    <div className='auctionfiltersection'>
                        <div className='auctionviewopt'>
                            <TfiLayoutGrid3Alt className={'viewicon '+(viewStyle==='grid'?'viewselected':'')}/> 
                            <FaList className={'viewicon mview'+(viewStyle==='list'?'viewselected':'')}/>
                        </div>
                        <div className='auctionsort'>
                            <div className='sorttitle'>Sort by</div>
                            <select
                                className='auctionsortselect'
                            >
                                <option value='today'>Today</option>
                                <option value='endingsoon'>Ending Soon</option>
                                {/* <option value='upcoming'>Upcoming</option> */}
                            </select>
                        </div>
                    </div>
                    <div className='auctionbox'>
                        <Auctions 
                            auctionItems = {auctionItems}
                            auctionImages = {auctionImages}
                            startBidding = {startBidding}
                            userRecord = {userRecord}
                        />
                    </div>
                    <div className='viewmoreauction'>{'<  View More Auctions  >'}</div>
                </div>
            </main>
            <footer className='footer'>
                <div>
                    {/* <div>ABOUT US</div> */}
                </div>
                <div>

                </div>
            </footer>
        </>
    )
}

export default LandingPage

