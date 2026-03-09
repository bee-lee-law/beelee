import Image from 'next/image';
import logoCube from '@/public/BeeCube.svg'

export default function Logo(){
    return <Image src={logoCube} alt={'logo'} style={{width: '48px', height: 'auto'}} />
}