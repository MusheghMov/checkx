import {
  SignedOut,
  SignedIn,
  UserButton,
  useClerk,
} from "@clerk/chrome-extension";
import { Button } from "./ui/button";
import { CardHeader, CardTitle } from "./ui/card";
import { Link } from "wouter";

export default function Header() {
  const auth = useClerk();

  return (
    <CardHeader className="flex flex-row items-center justify-between px-0">
      <Link to="/" className="cursor-pointer">
        <CardTitle className="text-lg font-bold">Haibrid</CardTitle>
      </Link>

      <div className="flex items-center gap-2">
        <div className="">
          <SignedOut>
            <Button
              onClick={() => {
                const signinURL = auth.buildSignInUrl();

                browser.tabs.create({
                  url: signinURL,
                });
              }}
              variant="outline"
              className="flex-1"
            >
              Sign In
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  rootBox: "!w-full !z-[10000]",
                  userButtonBox: "flex !flex-row-reverse",
                  userButtonTrigger: "!w-full !justify-start !text-foreground",
                  userButtonOuterIdentifier:
                    "!text-foreground group-data-[state=collapsed]:hidden",
                  userButtonPopoverMain: "dark:!bg-accent text-foreground",
                  userButtonPopoverFooter: "!hidden",
                  userButtonPopoverActions: "!border-border",
                  userButtonPopoverActionButton:
                    "!text-foreground !border-border",
                  userButtonPopoverCustomItemButton:
                    "!text-foreground !border-border",
                },
              }}
              userProfileProps={{
                appearance: {
                  elements: {
                    scrollBox:
                      "!bg-accent border-border !shadow-none !border-border md:!border-l !border-t md:!border-none",
                    page: "!text-foreground",
                    profileSection: "!border-border",
                    profileSectionContent: "!text-foreground",
                    userPreview: "!text-foreground",
                    profileSectionPrimaryButton: "!text-foreground",
                    headerTitle: "!text-foreground",
                    profileSectionPrimaryButton__danger:
                      "!text-white !bg-destructive",
                    menuButtonEllipsis: "!text-foreground/50",
                    actionCard: "!text-foreground !bg-background",
                    avatarImageActionsUpload: "!text-foreground !bg-muted",
                    avatarImageActionsRemove: "!bg-destructive !text-white",
                    formFieldLabel: "!text-gray-500",
                    formButtonReset: "!bg-secondary !text-foreground",
                    menuList: "!text-foreground !bg-background",
                    navbar:
                      "md:dark:[&_h1]:!text-white md:[&>*:last-child]:!hidden",
                    navbarMobileMenuRow: "dark:!bg-accent !text-foreground",
                    navbarButton: "!text-foreground",
                    navbarMobileMenuButton: "!text-foreground",
                    footer: "!hidden",
                    badge: "!text-foreground !border-gray-500",
                    "profileSectionPrimaryButton-danger":
                      "!text-foreground !bg-destructive",
                  },
                },
              }}
            />
          </SignedIn>
        </div>
        <ModeToggle />
      </div>
    </CardHeader>
  );
}
