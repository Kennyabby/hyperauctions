import '../SpecialStyles/Displays.css'
import { useState } from 'react'

const Spinner = ({diameter, defaultcolor, loadingcolor, borderwidth, spintime})=>{
    return(
        <>
            <div className='spinner'
                style={{
                    width:`${diameter}px`,
                    height:`${diameter}px`,
                    border:`${borderwidth}px solid ${defaultcolor}`,
                    borderTop: `${borderwidth}px solid ${loadingcolor}`,
                    animation: `spin ${spintime}s linear infinite`,
                    borderRadius: '50%',
                    margin:'auto'
                }}
            ></div>
        </>
    )
}

export default Spinner