import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export function FAQ() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Frequently Asked Questions
      </h1>

      <Accordion type="single" collapsible className="max-w-3xl mx-auto">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            What is The Million Dollar Vibe Page?
          </AccordionTrigger>
          <AccordionContent>
            The Million Dollar Vibe Page is a platform where you can purchase
            pixel blocks to showcase your coding skills, projects, and startups.
            It's inspired by the original Million Dollar Homepage.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>How do I purchase a pixel block?</AccordionTrigger>
          <AccordionContent>
            You can purchase a pixel block by selecting an available location on
            the grid, filling out the project details form, and completing the
            payment process.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>
            Can I update my project information after purchase?
          </AccordionTrigger>
          <AccordionContent>
            No, project information and block location cannot be updated after
            purchase. Please ensure all details are correct before completing
            your purchase.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger>
            How long will my pixel block be displayed?
          </AccordionTrigger>
          <AccordionContent>
            Your pixel block will be displayed indefinitely as long as the
            website remains operational.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger>How can I contact support?</AccordionTrigger>
          <AccordionContent>
            You can reach out to us at @thevibepixelpage for any questions or
            support needs.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6">
          <AccordionTrigger>
            What happens after the grid is complete?
          </AccordionTrigger>
          <AccordionContent>
            Once the grid is complete, two exciting things will happen:
            <br />
            <br />
            <strong>NFT Minting:</strong> The entire grid will become mintable
            as a unique NFT, allowing participants and collectors to own a
            lasting digital piece of this collaborative project.
            <br />
            <br />
            <strong>Community Investment:</strong> 33% of the generated revenue
            will be reinvested directly into three different projects featured
            on the grid. These projects will be democratically selected by the
            community, empowering participants to support initiatives they're
            passionate about.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default FAQ;
