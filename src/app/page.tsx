"use client";

import FeaturedTechnicians from "./component/Home/FeaturedTechnicians";
import HeroSection from "./component/Home/HomeSections";
import HowItWorks from "./component/Home/HowItWorks";
import PopularServices from "./component/Home/PopularServices";



export default function Profile() {

    return (
        <div>
  <HeroSection/>
  <PopularServices/>
  <FeaturedTechnicians/>
  <HowItWorks/>
        </div>
    );
}