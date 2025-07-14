import React from 'react'
import Image from 'next/image'

const CertificateComp = () => {
  return (
    <div className='flex justify-center items-center w-[90vw] mx-auto'>
        
         <Image 
           src="/images/certificate.svg"
           alt="Course certificate"
           width={400}
           height={300}
           className="w-full h-auto"
         />
        
     </div>
  )
}

export default CertificateComp