import { library } from "@fortawesome/fontawesome-svg-core";
import { faAddressCard } from "@fortawesome/free-regular-svg-icons/faAddressCard";
import { faBell as farBell } from "@fortawesome/free-regular-svg-icons/faBell";
import { faBookmark as farBookmark } from "@fortawesome/free-regular-svg-icons/faBookmark";
import { faCalendar as farCalendar } from "@fortawesome/free-regular-svg-icons/faCalendar";
import { faCircle } from "@fortawesome/free-regular-svg-icons/faCircle";
import { faCircleCheck as farCircleCheck } from "@fortawesome/free-regular-svg-icons/faCircleCheck";

library.add(
  faAddressCard,
  farBell,
  farBookmark,
  farCalendar,
  faCircle,
  farCircleCheck
);

console.log("icons initialized...");
