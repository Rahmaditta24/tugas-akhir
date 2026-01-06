<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RumusanMasalahCategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'name' => $this->name,
            'slug' => $this->slug,
            'image_url' => $this->image_url,
            'statements' => RumusanMasalahStatementResource::collection($this->whenLoaded('statements')),
        ];
    }
}