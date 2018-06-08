import {Model} from "chomex";

export class Playlist extends Model {
  public static schema = {
    previews: Model.Types.array.isRequired,
  };
}
