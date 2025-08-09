import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import About from "@/components/home/About";
import Testimonials from "@/components/home/Testimonials";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Services />
      <About />
      <Testimonials />
    </Layout>
  );
};

export default Index;
