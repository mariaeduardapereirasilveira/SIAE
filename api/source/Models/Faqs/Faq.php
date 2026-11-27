<?php

namespace Source\Models\Faqs;

use Source\Core\Model;

class Faq extends Model
{
    private ?int $id;
private ?int $faqCategoryId;
    private ?string $question;
    private ?string $answer;
    private ?int $active;

public function __construct(?int $id = null, ?int $faqCategoryId = null,
 ?string $question = null, ?string $answer = null, ?int $active = 1)
    {
        $this->id = $id;
       $this->faqCategoryId = $faqCategoryId;
        $this->question = $question;
        $this->answer = $answer;
        $this->active = $active;

        $this->table = 'faqs';
        $this->primaryKey = 'id';
        $this->fillable = ['faqCategoryId', 'question', 'answer', 'active'];
    }

  public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }
  public function getFaqCategoryId(): ?int
    {
        return $this->faqCategoryId;
    }

    public function setFaqCategoryId(int $faqCategoryId): void
    {
        $this->faqCategoryId = $faqCategoryId;
    }
  public function getQuestion(): ?string
    {
        return $this->question;
    }

    public function setQuestion(string $question): void
    {
        $this->question = $question;
    }
  public function getAnswer(): ?string
    {
        return $this->answer;
    }

    public function setAnswer(string $answer): void
    {
        $this->answer = $answer;
    }
  public function getActive(): ?int
    {
        return $this->active;
    }

    public function setActive(int $active): void
    {
        $this->active = $active;
    }


}