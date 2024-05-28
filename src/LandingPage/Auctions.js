import React, { useState, useEffect } from 'react';

const Auctions = ({ auctionItems, auctionImages, startBidding, userRecord }) => {
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
      {auctionItems.length ? auctionItems.slice(0, 21).map((auction, index) => {
        const starting = getTimerString(startTimers[index])
        const ending = getTimerString(targetTimers[index])
        const bidPeriod = (auction.target-auction.start)
        // console.log(startTimers[index])
        return (
          <div className='auctioncard' key={auction._id}>
            <div className='auctioncardtitle'>
              <div className={'auctionstatus'+(targetTimers[index]<=0?' bidended':'')}>
               {startTimers[index]>0 && 'Live Soon'}
               {targetTimers[index]<=bidPeriod && targetTimers[index] >=0 && 'Live'}
               {targetTimers[index]<=0 && 'Live Ended'}
              </div>
              <div className='auctionprice'>
                {'₦' + auction.initialprice}
              </div>
            </div>
            <img src={auctionImages[auction.src]} className='auctionimg' alt={auction.name} />
            <div className='auctionname'>{auction.name}</div>
            <div className='auctiondesc'>{auction.description}</div>
            <div className='auctionlive'>
              <div className='auctionbids'>
                <div className='bid-no'>{auction.bids}</div>
                <div>All Bids</div>
              </div>
              <div className='auctionbiders'>
                <div className='bid-no'> {auction.biders.length}</div>
                <div>Bidders</div>
              </div>

              {userRecord!==null && <div className='myauctionbids'>
                <div className='bid-no'>{auction.mybids}</div>
                <div>Your Bids</div>
              </div>}
            </div>
            
            {startTimers[index]>0 && <div className='auctiontimer'>
              
              <div>Live in</div>
              <div className='timervalue'>{starting}</div>
            </div>}

            {targetTimers[index]<=bidPeriod && targetTimers[index]>=0+
            6 && <div className='auctiontimer'>
              
              <div>Ends in</div>
              <div className='timervalue'>{ending}</div>
            </div>}

            <div
              className={'auctionbtn'+(targetTimers[index]<=0?' bidended':'')}
              onClick={() => { 
                if (targetTimers[index]>0){
                  startBidding(auction) 
                }
              }}
            >{starting==='EXPIRED'?'BID NOW':(startTimers[index]<=3600000?'STARTING SOON':'UPCOMING')}</div>
          </div>
        )
      }) : <div>Loading...</div>
      }
    </div>
  );
};

export default Auctions;
