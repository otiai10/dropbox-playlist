import {Model} from "chomex";

export class Playlist extends Model {

  public static schema = {
    autoplay: Model.Types.bool,
    previews: Model.Types.array.isRequired,
  };

  public previews: string[];
  public autoplay: boolean;
}
