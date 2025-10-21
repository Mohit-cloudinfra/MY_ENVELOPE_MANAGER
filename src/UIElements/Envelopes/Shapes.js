import { TfiLayoutLineSolid } from 'react-icons/tfi';
import { LuDot, LuRedoDot } from 'react-icons/lu';
import { LiaCircleSolid } from "react-icons/lia";
import { MdOutlineRectangle ,MdRectangle} from "react-icons/md";
import { PiDiamondFill, PiDiamondThin } from "react-icons/pi";
import { FaCircle } from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
import { PiLineVerticalLight } from "react-icons/pi";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { IoIosStar } from "react-icons/io";


import { renderToStaticMarkup } from "react-dom/server";

const Rhombusfill = renderToStaticMarkup(
    <div style={{ width: '100%', height: '100%' }}>
        <PiDiamondFill style={{ width: '100%', height: '100%' }} />
    </div>
);

const RhombusThin = renderToStaticMarkup(
    <div style={{ width: '100%', height: '100%', }}>
        <PiDiamondThin style={{ width: '100%', height: '100%' }} />
    </div>
);

const Heartfill = renderToStaticMarkup(
    <div style={{ width: '100%', height: '100%' }}>
        <FaHeart style={{ width: '100%', height: '100%' }} />
    </div>
);

const Starfill = renderToStaticMarkup(
    <div style={{ width: '100%', height: '100%' }}>
        <IoIosStar style={{ width: '100%', height: '100%' }} />
    </div>
);

const HeartLight = renderToStaticMarkup(
    <div style={{ width: '100%', height: '100%', }}>
        <FaRegHeart style={{ width: '100%', height: '100%' }} />
    </div>
);

const ArrowRight = renderToStaticMarkup(
    <div style={{ width: '100%', height: '100%', }}>
        <BsArrowRight style={{ width: '100%', height: '100%' }} />
    </div>
);



const shapeConfigs = {
    horizontalline: {
        icon: <TfiLayoutLineSolid size={30} />,
        content: `<div style="width: 100%; height: 2px; background-color: black"></div>`,
        width: 100,
        height: 2,
    },
    verticalline: {
        icon: <PiLineVerticalLight size={30} />,
        content: `<div style="width: 2px; height: 100%; background-color: black"></div>`,
        width: 50,
        height: 200,
    },
    dot: {
        icon: <FaCircle size={30} />,
        content: `<div style="width:100%; height: 100%;border-radius: 50%; background-color: black"></div>`,
        width: 60,
        height: 60,
    },
    circle: {
        icon: <LiaCircleSolid size={30} />,
        content: `<div style="width:100%; height: 100%; border-radius: 50%;border: 1px solid black"></div>`,
        width: 60,
        height: 60,
    },
    rectangleout: {
        icon: <MdOutlineRectangle size={30} />,
        content: `<div style="width: 100%; height: 100%; border: 1px solid black"></div>`,
        width: 100,
        height: 50,
    },
    Rectanglefill: {
        icon: <MdRectangle size={30} />,
        content: `<div style="width: 100%; height: 100%; background-color: black"></div>`,
        width: 100,
        height: 50,
    },
    rhombusfill: {
        icon: <PiDiamondFill size={30} />,
        content: `<div style="width: 100%; height: 100%;color:'black">${Rhombusfill}</div>`,
        width: 100,
        height: 100, 
    },
    rhombusThin: {
        icon: <PiDiamondThin size={30} />,
        content: `<div style="width: 100%; height: 100%;color:'black'>${RhombusThin}</div>`,
        width: 100,
        height: 100, 
    },
    ArrowRight: {
        icon: <BsArrowRight size={30} />,
        content: `<div style="width: 100%; height: 100%;color:'black'>${ArrowRight}</div>`,
        width: 100,
        height: 30,
    },
    heartIconfill:{
        icon: <FaHeart size={30} />,
        content: `<div style="width: 100%; height: 100%;color:'black'>${Heartfill}</div>`,
        width: 100,
        height: 100, 
    },
    heartIconThin:{
        icon: <FaRegHeart size={30} />,
        content: `<div style="width: 100%; height: 100%;color:'black'>${HeartLight}</div>`,
        width: 100,
        height: 100, 
    },
    starIconfill:{
        icon: <IoIosStar size={30} />,
        content: `<div style="width: 100%; height: 100%;color:'black';>${Starfill}</div>`,
        width: 100,
        height: 100, 
    },
    rectangleoutRadius: {
        icon: <MdOutlineRectangle size={30}/>,
        content: `<div style="width: 100%; height: 100%; border: 2px solid black;border-radius:10px"></div>`,
        width: 100,
        height: 50,
    },

};

export { shapeConfigs }