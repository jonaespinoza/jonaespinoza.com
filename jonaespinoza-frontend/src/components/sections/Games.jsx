import SectionWrapper from "../main/SectionWrapper";
import GameCard from "../ui/GameCard";

import SnakeFront from "../../assets/games/snake.png";
import ArkanoidFront from "../../assets/games/arkanoid.png";
import RpgFront from "../../assets/games/rpg.png";

function Games() {
  return (
    <SectionWrapper
      id="juegos"
      titleKey="games.title"
      contentKey="games.description"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        <GameCard
          tKey="games.snake"
          frontImage={SnakeFront}
          link="/juegos/viborita"
        />
        <GameCard
          tKey="games.arkanoid"
          frontImage={ArkanoidFront}
          link="/juegos/arkanoid"
        />
        <GameCard tKey="games.rpg" frontImage={RpgFront} link="/juegos/rpg" />
      </div>
    </SectionWrapper>
  );
}

export default Games;
