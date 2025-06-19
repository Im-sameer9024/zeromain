export interface Tag {
    id: string;
    name: string;
    description: string;
    color?: string | null;
}


export interface TagForm {
    name: string;
    color: string;
}