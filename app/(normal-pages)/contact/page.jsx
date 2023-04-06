import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";

const ContactPage = () => {
  return (
    <>
      <Breadcrumb
        pageName="Contact Page"
        description="At GPTCoverLetter, we're committed to providing exceptional support to our customers. Whether you have a question, concern, or issue, our team of experienced professionals is here to help. Count on us to guide you through any challenge and ensure that your experience with us is a positive one."
      />

      <Contact />
    </>
  );
};

export default ContactPage;
