import svgPaths from "./svg-ptzecz3xlz";
import imgImageWithFallback from "figma:asset/5db48f6020e78aab9939596d726eebf3b6231c18.png";

function Paragraph() {
  return (
    <div className="h-[27px] overflow-clip relative shrink-0 w-[112px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[27px] left-0 not-italic text-[#2e3a59] text-[18px] top-0 whitespace-nowrap">Masala Dosa</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[20.399px] relative shrink-0 w-[37.052px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[20.4px] left-0 not-italic text-[#ff6b35] text-[13.6px] top-[-0.67px] whitespace-nowrap">Rs.89</p>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[18px] relative shrink-0 w-[16.076px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[18px] left-[0.08px] not-italic text-[#888] text-[12px] top-[4px] whitespace-nowrap">x 1</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex gap-[4px] h-[20.399px] items-center relative shrink-0" data-name="Container">
      <Paragraph1 />
      <Text />
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative">
        <Paragraph />
        <Container1 />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[14px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-3/4 left-[12.5%] right-[12.5%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-0.58px_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 1.16667">
            <path d="M0.583333 0.583333H11.0833" id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" strokeWidth="1.16667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[8.33%] left-[20.83%] right-[20.83%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-6.25%_-7.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.33333 10.5">
            <path d={svgPaths.p21838680} id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" strokeWidth="1.16667" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-[33.33%] right-[33.33%] top-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-25%_-12.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.83333 3.5">
            <path d={svgPaths.p2c2c0a80} id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" strokeWidth="1.16667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[45.83%_58.33%_29.17%_41.67%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-0.58px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.16667 4.66667">
            <path d="M0.583333 0.583333V4.08333" id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" strokeWidth="1.16667" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[45.83%_41.67%_29.17%_58.33%]" data-name="Vector">
        <div className="absolute inset-[-16.67%_-0.58px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.16667 4.66667">
            <path d="M0.583333 0.583333V4.08333" id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" strokeWidth="1.16667" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Icon />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#f1f5f9] relative rounded-[16777200px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[7px] relative">
        <Button2 />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex h-[71.39px] items-start justify-between left-px pl-[9.996px] pr-[8px] pt-[9.996px] top-[193.99px] w-[216.979px]" data-name="Container">
      <Frame />
      <Button1 />
    </div>
  );
}

function ImageWithFallback() {
  return (
    <div className="absolute h-[187.998px] left-0 rounded-[8px] top-0 w-[214.971px]" data-name="ImageWithFallback">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[8px] size-full" src={imgImageWithFallback} />
    </div>
  );
}

function Container4() {
  return <div className="absolute border-[#ededed] border-[0.666px] border-solid h-[187.998px] left-0 rounded-[8px] top-0 w-[214.971px]" data-name="Container" />;
}

function Container3() {
  return (
    <div className="absolute h-[187.998px] left-px rounded-[8px] top-0 w-[214.971px]" data-name="Container">
      <ImageWithFallback />
      <Container4 />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute bg-[#22c55e] content-stretch flex items-center justify-center left-[180.99px] rounded-[22338500px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] size-[27.992px] top-[3.99px]" data-name="Container">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[18px] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap">1</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[187.998px] left-px overflow-clip top-[5.99px] w-[216.979px]" data-name="Container">
      <Container3 />
      <Container5 />
    </div>
  );
}

function CashierPos() {
  return (
    <div className="absolute h-[266.378px] left-0 overflow-clip rounded-[14px] top-0 w-[218.976px]" data-name="CashierPOS">
      <Container />
      <Container2 />
    </div>
  );
}

function CashierPos1() {
  return <div className="absolute bg-[rgba(255,255,255,0)] border-[#22c55e] border-[0.666px] border-solid h-[266.378px] left-0 rounded-[14px] shadow-[0px_0px_0px_0px_rgba(34,197,94,0.3)] top-0 w-[218.976px]" data-name="CashierPOS" />;
}

export default function Button() {
  return (
    <div className="bg-white relative rounded-[14px] size-full" data-name="Button">
      <CashierPos />
      <CashierPos1 />
    </div>
  );
}