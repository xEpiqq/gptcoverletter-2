import Link from "next/link";
import Dashnav from "./dashnav";

const Hero = () => {
  return (
    <>
      <section id="home" className="flex relative w-100 h-screen outline">
        <Dashnav />
        Hello
      </section>
    </>
  );
};

export default Hero;