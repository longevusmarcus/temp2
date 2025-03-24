import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Mail, Twitter as TwitterIcon } from "lucide-react";

export default function Contact() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
        <CardDescription>
          Have questions? Get in touch with our team.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-muted-foreground"
          >
            <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
            <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
          </svg>
          <span>@the1Mdollapage</span>
        </div>
        <div className="flex items-center space-x-2">
          <TwitterIcon className="h-5 w-5 text-muted-foreground" />
          <span>@pixelblocks</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline">
          <Mail className="mr-2 h-4 w-4" /> Email Us
        </Button>
      </CardFooter>
    </Card>
  );
}
