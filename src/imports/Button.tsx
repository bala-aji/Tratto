import imgFa from "figma:asset/8340b97eb910cfd29fe0fea03a6a0ee07b6c1228.png";

function Fa() {
  return (
    <div className="h-[188px] pointer-events-none relative rounded-[8px] shrink-0 w-[178px]" data-name="fa">
      <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[8px] size-full" src={imgFa} />
      <div aria-hidden="true" className="absolute border border-[#ededed] border-solid inset-0 rounded-[8px]" />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col h-[188.398px] items-center justify-center overflow-clip relative shrink-0 w-full" data-name="Container">
      <Fa />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[27px] overflow-clip relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[27px] left-0 not-italic text-[#2e3a59] text-[18px] top-[0.5px] whitespace-nowrap">Idli Sambar</p>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[20.398px] relative shrink-0 w-[36.883px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20.4px] left-0 not-italic text-[#ff6b35] text-[13.6px] top-[-0.5px] whitespace-nowrap">Rs.59</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="h-[20.398px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pr-[131.516px] relative size-full">
          <Text />
        </div>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="h-[71.398px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[4px] items-start pt-[10px] px-[10px] relative size-full">
        <Paragraph />
        <Container2 />
      </div>
    </div>
  );
}

export default function Button() {
  return (
    <div className="bg-white relative rounded-[14px] size-full" data-name="Button">
      <div className="content-stretch flex flex-col items-start overflow-clip pb-px pt-[6px] px-px relative rounded-[inherit] size-full">
        <Container />
        <Container1 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[14px]" />
    </div>
  );
}