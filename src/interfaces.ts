import moment from 'moment';
import { SimpleGit } from 'simple-git';

export interface IAnalyticsSnippetContext {
  prevSHA1: string | null;
  moment: moment.Moment;
}

export interface IAnalyticsSnippet {
  name: string;
  fn(repo: SimpleGit, context?: IAnalyticsSnippetContext): Promise<string | Number | null>;
}

export interface IResult {
  date: Date;
  result: string | Number | null;
}

export interface IResults {
  [key: string]: IResult[];
}

export interface IProject {
  name: string;
  url: string;
  branch: string;
  snippets: IAnalyticsSnippet[];
}
