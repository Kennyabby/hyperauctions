import React, { useState, useEffect } from 'react';
import { PiClockCountdownBold } from "react-icons/pi";

const Auctions = ({ auctionItems, auctionImages, startBidding, userRecord, userAuctions }) => {
  const calculateTimeLeft = (target) => {
    const now = new Date().getTime();
    const targetDate = new Date(target).getTime();
    const distance = targetDate - now;

    return distance
  };

  const getTimerString = (time)=>{
    if (time <= 0) return 'EXPIRED';
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    return `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
  }

  function formatDate(datetime) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = new Date(datetime)
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dayOfMonth = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // return `${day}, ${month} ${dayOfMonth}, ${year} ${hours}:${minutes}:${seconds}`;
    return `${month} ${dayOfMonth}, ${year}`;
  }
  const [startTimers, setStartTimers] = useState(
    auctionItems.map((auction) => calculateTimeLeft(auction.start))
  );

  const [targetTimers, setTargetTimers] = useState(
    auctionItems.map((auction) => calculateTimeLeft(auction.start))
  );

  useEffect(() => {
    const startTimerInterval = setInterval(() => {
      setStartTimers(
        auctionItems.map((auction) => calculateTimeLeft(auction.start))
      );
    }, 1000);
  
    return () => clearInterval(startTimerInterval);
  }, [auctionItems]);

  useEffect(()=>{
    const targetTimerInterval = setInterval(() => {
      setTargetTimers(
        auctionItems.map((auction) => calculateTimeLeft(auction.target))
      );
    }, 1000);

    return () => clearInterval(targetTimerInterval);

  },[auctionItems])
  
  return (
    <div className='auctionbox'>
      {userAuctions!==null ? (auctionItems.length ? (auctionItems.slice(0, 21).map((auction, index) => {
        const starting = getTimerString(startTimers[index])
        const ending = getTimerString(targetTimers[index])
        const bidPeriod = (auction.target-auction.start)
        return (
          <div className='auctioncard' key={String(index)+auction._id}>
            <PiClockCountdownBold className='livecountdown'/>
            <div className='auctioncardtitle'>
              <div className={'auctionstatus'+(targetTimers[index]<=0?' bidended':'')}>
                <div>
                  {startTimers[index]>0 && 'Live Soon'}
                  {targetTimers[index]<=bidPeriod && targetTimers[index] >=0 && 'Live'}
                  {targetTimers[index]<=0 && 'Live Ended'}
                </div>
              </div>
              <div className='auctionpricediv'> 
                <div className='auctionprice'>
                  {'₦'+auction.initialprice}
                </div>
                <div className='startingprice'>Starting price:</div>
              </div>
            </div>
            <img src={auctionImages[auction.src]} className='auctionimg' alt={auction.name} />
            <div className='auctionname'>{auction.name}</div>
            <div className='auctiondesc'>{auction.description}</div>
            <div className='auctionliveinfo'>
              <div className='liveinfocontent'>
                <div className='maincontent'>
                  <div className='bidpricediv'> 
                    <div className='bidprice'>
                      {'₦'+(auction.bidprice?Number(auction.bidprice).toLocaleString():auction.initialprice)}
                    </div>
                    {startTimers[index] > 0 && <div className='bidstatus'>Highest bid so far:</div>}
                    {targetTimers[index]<=bidPeriod && targetTimers[index]>=0 && <div className='bidstatus'>Highest bid so far:</div>}
                    {targetTimers[index] < 0 && <div className='bidstatus'>Winning Price</div>}
                  </div>

                  {startTimers[index] > 0 && <div className='auctiontimer'>
                    <div className='timer'>
                      <div className='timervalue'>{formatDate(auction.start)}</div>
                      <div className='timerstatus'>Starting</div>
                    </div>
                    <div className='timer'>
                      <div className='timervalue'>{formatDate(auction.target)}</div>
                      <div className='timerstatus'>Ends by</div>
                    </div>
                  </div>}
                  {targetTimers[index]<=bidPeriod && targetTimers[index]>=0 && <div className='auctiontimer'>
                    <div className='timer'>
                      <div className='timervalue'>{formatDate(auction.start)}</div>
                      <div className='timerstatus'>Started</div>
                    </div>
                    <div className='timer'>
                      <div className='timervalue'>{formatDate(auction.target)}</div>
                      <div className='timerstatus'>Ends by</div>
                    </div>
                  </div>}
                  {targetTimers[index] < 0 && <div className='auctiontimer'>
                    <div className='timer'>
                      <div className='timervalue'>{formatDate(auction.start)}</div>
                      <div className='timerstatus'>Started</div>
                    </div>
                    <div className='timer'>
                      <div className='timervalue'>{formatDate(auction.target)}</div>
                      <div className='timerstatus'>Ended</div>
                    </div>
                  </div>}
                  <div
                    className={'auctionbtn'+(targetTimers[index]<=0?' bidended':'')}
                    onClick={() => { 
                      if (targetTimers[index]>0){
                        startBidding(auction) 
                      }
                    }}
                  >
                    {starting==='EXPIRED'?'BID NOW':(startTimers[index]<=3600000?'STARTING SOON':'UPCOMING')}
                  </div>
                </div>
              </div>
              <div className='auctionlive'>
                <div className='auctionbids'>
                  <div className='bid-no'>{auction.bids}</div>
                  <div>Bids</div>
                </div>
                <div className='auctionbiders'>
                  <div className='bid-no'> {auction.biders.length}</div>
                  <div>Bidders</div>
                </div>
                {<div className='myauctionbids'>
                  <div className='bid-no'>{auction.mybids}</div>
                  <div>You</div>
                </div>}
              </div>
            </div>
          </div>
        )
      })):<div>
        No Auctions at the moment
      </div>) : <div>Loading...</div>
      }
    </div>
  );
};

export default Auctions;
